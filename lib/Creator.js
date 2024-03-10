const { fetchRepoList, fetchTagList } = require('./request');
const Inquirer = require('inquirer');
const { wrapLoading } = require('./util');
const downloadGitRepo = require('download-git-repo'); // 无需登录可下载repo，不支持promise
const util = require('util');
const path = require('path');
const fs = require('fs-extra');
// 编译
const { renderTemplate } = require('./render');
let { render } = require('consolidate').ejs; // 模板引擎
render = util.promisify(render); // 包装渲染方法

class Creator {
  constructor(projectName, targetDir) {
    this.name = projectName;
    this.target = targetDir;
    // 转换成promise
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  async fetchRepo() {
    let repos = await wrapLoading(fetchRepoList, 'fetching template');
    // let repos = await fetchRepoList();
    if (!repos) return;
    repos = repos.map((item) => item.name);

    console.log(repos);

    let { repo } = await Inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      message: 'please choose a template: ',
    });

    return repo;
  }

  async fetchTag(repo) {
    let tags = await wrapLoading(fetchTagList, 'fetching tag list', repo);

    if (!tags) return;

    tags = tags.map((item) => item.name);

    let { tag } = await Inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tags,
      message: 'please choose a tag: ',
    });

    return tag;
  }

  async download(repo, tag) {
    // 1. 需要拼接出下载路径
    // zhu-cli/vue-template#1.0
    let requestUrl = `zhu-cli/${repo}${tag ? `#${tag}` : ''}`;

    // 2. 把资源下载到某个路径上（后续可增加缓存功能，应该下载到系统目录中，稍后可以再使用ejs handlebar 区渲染模板，最后生成结果，再写入）
    // 放到系统文件中 =》 模板 和用户的其他选择 =》生成结果 放到当前目录下
    const downloadPath = path.join(process.cwd(), `${repo}@${tag}`);
    await this.downloadGitRepo(requestUrl, downloadPath);
    return downloadPath;
  }

  async create() {
    // 1) 先去拉取当前组织下的模板

    let repo = await this.fetchRepo();
    console.log(repo);

    // 2) 再通过模板找到版本号

    let tag = await this.fetchTag(repo);
    console.log('tag', tag);

    // 3) 下载

    const downloadPath = await this.download(repo, tag);

    // 4) 编译

    // 没有ask文件说明不需要编译
    if (!fs.existsSync(path.join(downloadPath, 'ask.json'))) {
      // 不需要编译，则直接拷贝到目标目录。
      fs.copy(downloadPath, this.target);
    } else {
      const result = await Inquirer.prompt(
        require(path.join(downloadPath, 'ask.json'))
      );
      await renderTemplate(downloadPath, this.target, result);
    }
  }
}

module.exports = Creator;
