import Token from '../models/Token.js';
import QueueState from '../models/QueueState.js';
import { getIO } from '../socketHandler.js';

const today = () => new Date().toISOString().split('T')[0];

// ── Get or create today's queue state ──
const getQueueState = async () => {
  let state = await QueueState.findOne({ date: today(), department: 'OPD' });
  if (!state) {
    state = await QueueState.create({ date: today(), department: 'OPD', currentTokenNumber: 0 });
  }
  return state;
};

// ── Generate a new token ──
export const generateToken = async ({ patientName, age, condition, priority, department }) => {
  const state = await getQueueState();
  state.currentTokenNumber += 1;
  state.totalTokensIssued += 1;
  await state.save();

  const token = await Token.create({
    tokenNumber: state.currentTokenNumber,
    patientName,
    age: age || null,
    condition: condition || '',
    priority: priority || 'general',
    isEmergency: priority === 'emergency',
    department: department || 'OPD',
    sessionDate: today(),
  });

  // Calculate estimated wait for this token
  token.estimatedWaitTime = await calculateWaitTime(token);
  await token.save();

  // Emit events
  const io = getIO();
  if (io) {
    io.to('queue-room').emit('token_created', token);
    emitQueueUpdate();
  }

  return token;
};

// ── Get active queue (priority-sorted: emergency → senior → general, then FIFO) ──
export const getQueue = async () => {
  const queue = await Token.find({
    sessionDate: today(),
    status: { $in: ['waiting', 'in-progress'] },
  })
    .sort({ status: 1 }) // in-progress first, then waiting
    .lean();

  // Sort waiting tokens by priority then creation time
  const inProgress = queue.filter(t => t.status === 'in-progress');
  const waiting = queue.filter(t => t.status === 'waiting');

  const priorityOrder = { emergency: 0, senior: 1, general: 2 };
  waiting.sort((a, b) => {
    const pDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    if (pDiff !== 0) return pDiff;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  // Recalculate wait times based on position
  const avgConsult = await getAvgConsultTime();
  const hour = new Date().getHours();
  const timeFactor = 1 + 0.15 * Math.sin((hour * Math.PI) / 12);

  waiting.forEach((token, index) => {
    token.estimatedWaitTime = Math.round(index * avgConsult * timeFactor);
  });

  return [...inProgress, ...waiting];
};

// ── Call next patient (respects priority) ──
export const callNextToken = async () => {
  // Priority order: emergency → senior → general, then FIFO within each
  const priorityOrder = ['emergency', 'senior', 'general'];

  let nextToken = null;
  for (const p of priorityOrder) {
    nextToken = await Token.findOneAndUpdate(
      { sessionDate: today(), status: 'waiting', priority: p },
      { status: 'in-progress', calledAt: new Date() },
      { sort: { createdAt: 1 }, new: true }
    );
    if (nextToken) break;
  }

  if (!nextToken) {
    throw new Error('No waiting patients in queue');
  }

  const io = getIO();
  if (io) {
    io.to('queue-room').emit('patient_called', nextToken);
    emitQueueUpdate();
  }

  return nextToken;
};

// ── Complete consultation ──
export const completeToken = async (tokenNumber) => {
  const token = await Token.findOneAndUpdate(
    { tokenNumber: Number(tokenNumber), sessionDate: today(), status: 'in-progress' },
    { status: 'done', completedAt: new Date() },
    { new: true }
  );

  if (!token) {
    throw new Error('Token not found or not in-progress');
  }

  // Calculate consultation duration
  if (token.calledAt) {
    token.consultationDuration = Math.round(
      (token.completedAt - token.calledAt) / 60000
    );
    await token.save();
  }

  // Update queue state
  const state = await getQueueState();
  state.totalCompleted += 1;
  await state.save();

  const io = getIO();
  if (io) {
    io.to('queue-room').emit('consultation_complete', token);
    emitQueueUpdate();
  }

  return token;
};

// ── Cancel a token ──
export const cancelToken = async (tokenId) => {
  const token = await Token.findOneAndUpdate(
    { _id: tokenId, status: { $in: ['waiting', 'in-progress'] } },
    { status: 'cancelled', cancelledAt: new Date() },
    { new: true }
  );

  if (!token) {
    throw new Error('Token not found or already completed/cancelled');
  }

  const state = await getQueueState();
  state.totalCancelled += 1;
  await state.save();

  emitQueueUpdate();
  return token;
};

// ── Get single token details ──
export const getTokenById = async (tokenId) => {
  const token = await Token.findById(tokenId).lean();
  if (!token) throw new Error('Token not found');
  return token;
};

// ── Calculate average consultation time (rolling window) ──
export const getAvgConsultTime = async () => {
  const recent = await Token.find({
    status: 'done',
    consultationDuration: { $gt: 0 },
  })
    .sort({ completedAt: -1 })
    .limit(20)
    .select('consultationDuration')
    .lean();

  if (recent.length === 0) return 10; // default 10 min

  const total = recent.reduce((sum, t) => sum + t.consultationDuration, 0);
  return Math.round(total / recent.length);
};

// ── Calculate wait time for a specific token ──
export const calculateWaitTime = async (token) => {
  const waitingAhead = await Token.countDocuments({
    sessionDate: today(),
    status: 'waiting',
    $or: [
      { priority: 'emergency', createdAt: { $lt: token.createdAt } },
      {
        priority: token.priority,
        createdAt: { $lt: token.createdAt },
      },
      ...(token.priority === 'general'
        ? [{ priority: { $in: ['emergency', 'senior'] } }]
        : token.priority === 'senior'
        ? [{ priority: 'emergency' }]
        : []),
    ],
  });

  const avgConsult = await getAvgConsultTime();
  const hour = new Date().getHours();
  const timeFactor = 1 + 0.15 * Math.sin((hour * Math.PI) / 12);

  return Math.round(waitingAhead * avgConsult * timeFactor);
};

// ── Emit queue update to all clients ──
export const emitQueueUpdate = async () => {
  const io = getIO();
  if (io) {
    const queue = await getQueue();
    io.to('queue-room').emit('queue_updated', queue);
    io.to('queue-room').emit('wait_time_updated', {
      avgWait: await getAvgConsultTime(),
      queueLength: queue.filter(t => t.status === 'waiting').length,
    });
  }
};
