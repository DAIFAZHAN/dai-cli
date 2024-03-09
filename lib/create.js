const path = require('path');
const fs = require('fs-extra'); // 比fs更多功能
const Inquirer = require('inquirer'); // 命令行交互
const Creator = require('./Creator');

module.exports = async function (projectName, options) {
  console.log('projectName', projectName);
  console.log('options', options);

  const cwd = process.cwd(); // 当前目录
  const targetDir = path.join(cwd, projectName);

  if (fs.existsSync(targetDir)) {
    if (options.force) {
      await fs.remove(targetDir);
    } else {
      // 提示用户是否确定要覆盖
      let { action } = await Inquirer.prompt([
        // 配置询问的方式
        {
          name: 'action',
          type: 'list', // 类型丰富
          message: `Target directory already exists. Pick an action: `,
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Cancel', value: false },
          ],
        },
      ]);
      if (!action) {
        return;
      } else if (action === 'overwrite') {
        console.log('Removing...');
        await fs.remove(targetDir);
        console.log('Removed.');
      }
    }
  }

  console.log('path.resolve()',path.resolve())
  console.log('__dirname',__dirname)
  new Creator(projectName, targetDir).create();
};
