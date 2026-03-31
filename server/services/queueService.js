import Token from '../models/Token.js';
import QueueState from '../models/QueueState.js';
import { getIO } from '../socketHandler.js';

const getToday = () => new Date().toISOString().split('T')[0];

// ── Get or create today's queue state ──
const getQueueState = async (date) => {
  const targetDate = date || getToday();
  let state = await QueueState.findOne({ date: targetDate, department: 'OPD' });
  if (!state) {
    state = await QueueState.create({ date: targetDate, department: 'OPD', currentTokenNumber: 0 });
  }
  return state;
};

// ── Generate a new token (OPTIMIZED: Reduced DB round-trips) ──
export const generateToken = async ({ patientName, age, condition, priority, department }) => {
  const todayDate = getToday();
  const avgConsultTime = await getAvgConsultTime();
  
  // Atomic increment + create token in single pipeline
  const [state, token] = await Promise.all([
    QueueState.findOneAndUpdate(
      { date: todayDate, department: 'OPD' },
      { $inc: { currentTokenNumber: 1, totalTokensIssued: 1 } },
      { upsert: true, new: true }
    ),
    new Token({
      patientName,
      age: age || null,
      condition: condition || '',
      priority: priority || 'general',
      isEmergency: priority === 'emergency',
      department: department || 'OPD',
      sessionDate: todayDate,
    }).save()
  ]);

  token.tokenNumber = state.currentTokenNumber;
  token.estimatedWaitTime = await calculateWaitTime(token);
  await token.save();

  // Emit events
  const io = getIO();
  if (io) {
    io.to('queue-room').emit('token_created', token);
    await emitQueueUpdate().catch(console.error);
  }

  return token;
};

// ── Get active queue (priority-sorted: emergency → senior → general, then FIFO) ──
export const getQueue = async () => {
  const avgConsult = await getAvgConsultTime();
  const timeFactor = 1 + 0.15 * Math.sin((new Date().getHours() * Math.PI) / 12);
  const avgConsultAdjusted = Math.round(avgConsult * timeFactor);

  const tokens = await Token.find({ 
    sessionDate: getToday(), 
    status: { $in: ['waiting', 'in-progress', 'done'] } 
  }).lean().exec();

  const statusOrder = { 'in-progress': 0, 'waiting': 1, 'done': 2 };
  const priorityOrder = { 'emergency': 0, 'senior': 1, 'general': 2 };

  tokens.sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    if (a.status === 'waiting') {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  let waitPos = 0;
  return tokens.map(t => {
    if (t.status === 'waiting') {
      waitPos++;
      t.waitingPosition = waitPos;
      t.estimatedWaitTime = waitPos * avgConsultAdjusted;
    } else {
      t.waitingPosition = 0;
      t.estimatedWaitTime = 0;
    }
    return t;
  });
};

// ── Call next patient (respects priority) ──
export const callNextToken = async () => {
  // Priority order: emergency → senior → general, then FIFO within each
  const priorityOrder = ['emergency', 'senior', 'general'];

  let nextToken = null;
  for (const p of priorityOrder) {
    nextToken = await Token.findOneAndUpdate(
      { sessionDate: getToday(), status: 'waiting', priority: p },
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
    await emitQueueUpdate().catch(console.error);
  }

  return nextToken;
};

// ── Complete consultation ──
export const completeToken = async (tokenNumber) => {
  const token = await Token.findOneAndUpdate(
    { tokenNumber: Number(tokenNumber), sessionDate: getToday(), status: 'in-progress' },
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
    await emitQueueUpdate().catch(console.error);
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

  await emitQueueUpdate().catch(console.error);
  return token;
};

// ── Get single token details ──
export const getTokenById = async (tokenId) => {
  const token = await Token.findById(tokenId).lean();
  if (!token) throw new Error('Token not found');
  return token;
};

// ── Calculate average consultation time (rolling window) - CACHED ──
let avgConsultCache = 10;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

export const getAvgConsultTime = async () => {
  const now = Date.now();
  
  // Return cache if valid
  if (now - cacheTimestamp < CACHE_TTL) {
    return avgConsultCache;
  }
  
  try {
    const recent = await Token.find({
      status: 'done',
      consultationDuration: { $gt: 0 },
    })
      .sort({ completedAt: -1 })
      .limit(20)
      .select('consultationDuration')
      .lean();

    if (recent.length === 0) {
      avgConsultCache = 10;
    } else {
      const total = recent.reduce((sum, t) => sum + t.consultationDuration, 0);
      avgConsultCache = Math.round(total / recent.length);
    }
    
    cacheTimestamp = now;
    return avgConsultCache;
  } catch (error) {
    console.error('Cache refresh failed:', error.message);
    return avgConsultCache; // Return stale cache on error
  }
};

// ── Calculate wait time for a specific token (FIXED: Correct priority logic) ──
export const calculateWaitTime = async (token) => {
  const sessionDate = getToday();
  const tokenPriority = token.priority || 'general';
  
  // Correct logic for counting patients ahead:
  // 1. ALL higher priority patients (regardless of creation time)
  // 2. Same priority patients created BEFORE this token
  let higherPriorityQuery = {};
  let samePriorityQuery = {};
  
  switch (tokenPriority) {
    case 'emergency':
      // Emergency only waits for other emergencies created before it
      samePriorityQuery = { 
        priority: 'emergency', 
        createdAt: { $lt: token.createdAt } 
      };
      break;
      
    case 'senior':
      // Seniors wait for ALL emergencies + seniors before them
      higherPriorityQuery = { priority: 'emergency' };
      samePriorityQuery = { 
        priority: 'senior', 
        createdAt: { $lt: token.createdAt } 
      };
      break;
      
    case 'general':
    default:
      // General wait for ALL emergencies + ALL seniors + generals before them
      higherPriorityQuery = { priority: { $in: ['emergency', 'senior'] } };
      samePriorityQuery = { 
        priority: 'general', 
        createdAt: { $lt: token.createdAt } 
      };
      break;
  }
  
  const waitingAhead = await Token.countDocuments({
    sessionDate,
    status: 'waiting',
    $or: [
      higherPriorityQuery,
      samePriorityQuery
    ].filter(q => Object.keys(q).length > 0)  // Filter out empty queries
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
    const avgConsultTime = await getAvgConsultTime(); // Single call
    const queueLength = queue.filter(t => t.status === 'waiting').length;
    
    io.to('queue-room').emit('queue_updated', queue);
    io.to('queue-room').emit('wait_time_updated', {
      avgWait: avgConsultTime,
      queueLength,
    });
  }
};
