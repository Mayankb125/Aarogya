const assert = require("assert");

delete process.env.FIREBASE_SERVICE_ACCOUNT;

const {
  addPatient,
  callNextToken,
  getQueueState,
  resetQueue,
  updateAvgConsultTime,
} = require("../services/queueService");

async function expectHttpError(action, statusCode, message) {
  try {
    await action();
    assert.fail("Expected request to fail");
  } catch (error) {
    assert.strictEqual(error.statusCode, statusCode);
    assert.strictEqual(error.message, message);
  }
}

async function run() {
  await resetQueue();

  await expectHttpError(
    () => addPatient({ name: "" }),
    400,
    "Patient name is required"
  );

  await expectHttpError(
    () => addPatient(),
    400,
    "Patient name is required"
  );

  await expectHttpError(
    () => callNextToken(),
    400,
    "Queue is empty"
  );

  await expectHttpError(
    () => updateAvgConsultTime(0),
    400,
    "Average consultation time must be greater than zero"
  );

  let state = await addPatient({
    name: "Anita Rao",
    reason: "Fever",
    avgConsultTime: 7,
  });

  assert.strictEqual(state.queue.length, 1);
  assert.strictEqual(state.queue[0].tokenNumber, 1);
  assert.strictEqual(state.queue[0].tokensAhead, 0);
  assert.strictEqual(state.queue[0].waitTime, 0);
  assert.strictEqual(state.avgConsultTime, 7);

  state = await addPatient({
    name: "Rahul Mehta",
    reason: "Follow up",
    avgConsultTime: 7,
  });

  assert.strictEqual(state.queue.length, 2);
  assert.strictEqual(state.queue[1].tokenNumber, 2);
  assert.strictEqual(state.queue[1].tokensAhead, 1);
  assert.strictEqual(state.queue[1].waitTime, 7);

  state = await addPatient({
    name: "Rahul Mehta",
    reason: "Same-name patient allowed",
    avgConsultTime: 7,
  });

  assert.strictEqual(state.queue.length, 3);
  assert.strictEqual(state.queue[2].tokenNumber, 3);

  state = await updateAvgConsultTime(10);
  assert.strictEqual(state.queue[1].waitTime, 10);
  assert.strictEqual(state.queue[2].waitTime, 20);

  state = await callNextToken();
  assert.strictEqual(state.currentToken.tokenNumber, 1);
  assert.strictEqual(state.currentToken.status, "serving");
  assert.strictEqual(state.queue.length, 2);
  assert.strictEqual(state.queue[0].tokensAhead, 0);
  assert.strictEqual(state.queue[0].waitTime, 0);

  state = await getQueueState();
  assert.strictEqual(state.lastTokenNumber, 3);

  state = await resetQueue();
  assert.strictEqual(state.queue.length, 0);
  assert.strictEqual(state.currentToken, null);
  assert.strictEqual(state.lastTokenNumber, 0);

  console.log("Queue service tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
