const ora = require('ora'); // loading

// 格式化参数
const clearArgs = (cmd) => {
  const args = {};
  cmd.options.forEach((o) => {
    const key = o.long.slice(2);
    if (cmd[key]) {
      args[key] = cmd[key];
    }
  });
  return args;
};

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
  clearArgs
};
