"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const octokit_1 = require("octokit");
const fs_1 = __importDefault(require("fs"));
const { GH_TOKEN } = process.env;
const octokit = new octokit_1.Octokit({ auth: GH_TOKEN });
const { listForRepo, createComment, listComments } = octokit.rest.issues;
const repoInfo = {
    owner: 'cuixiaorui',
    repo: 'study-every-day',
};
let username = '';
(async () => {
    const { data: { login }, } = await octokit.rest.users.getAuthenticated();
    username = login;
})();
async function getIssues() {
    const { data } = await listForRepo(repoInfo);
    return data.filter((s) => !s.pull_request);
}
async function commentIssue(issue, body) {
    await createComment(Object.assign(Object.assign({}, repoInfo), { issue_number: issue.number, body: body }));
}
function getDate() {
    let date = new Date();
    const fillZero = (num) => (num < 10 ? `0${num}` : num);
    return `${date.getFullYear()}-${fillZero(date.getMonth() + 1)}-${fillZero(date.getDate())}`;
}
async function getIssueComments(issue) {
    return (await listComments(Object.assign(Object.assign({}, repoInfo), { issue_number: issue.number }))).data;
}
async function isCommented(issue) {
    const comments = await getIssueComments(issue);
    return comments.some((s) => s.user.login === username);
}
async function main() {
    const templateText = fs_1.default.readFileSync('template.md', 'utf-8').toString();
    const issueArray = (await getIssues()).filter((s) => s.title.includes(getDate()));
    if (issueArray.length === 0)
        return console.log('no issue');
    const issue = issueArray[0];
    if (await isCommented(issue))
        return console.log('already commented');
    await commentIssue(issue, templateText);
    console.log('commented successfully');
}
main();
