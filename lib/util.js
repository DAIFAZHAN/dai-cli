const ora = require('ora'); // loading

async function wrapLoading(fn, message, ...args) {
  const spinner = ora(message);
  spinner.start();
  try {
    let repos = await fn(...args);
    spinner.succeed();
    return repos;
  } catch (e) {
    console.log(e);
    spinner.fail('request failed, refetching...');
    await sleep(2000);
    return wrapLoading(fn, message, ...args);
  }
}

async function sleep(n) {
  return new Promise((res, rej) => {
    setTimeout(res, n);
  });
}

module.exports = {
  sleep,
  wrapLoading,
};
