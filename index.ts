import { Octokit } from 'octokit'
import fs from 'fs'

const { GH_TOKEN, CANCEL_SUB } = process.env
const octokit = new Octokit({ auth: GH_TOKEN })
const { listForRepo, createComment, listComments } = octokit.rest.issues
const { deleteThreadSubscription } = octokit.rest.activity

const repoInfo = {
  owner: 'cuixiaorui',
  repo: 'study-every-day',
}

let username = ''

// 获取用户名，这里是因为不支持顶层 await 所以包了一层
;(async () => {
  const {
    data: { login },
  } = await octokit.rest.users.getAuthenticated()
  username = login
})()

type Await<T> = T extends Promise<infer R> ? R : T
type Issue = Await<ReturnType<typeof listForRepo>>['data'][0]

// 因为 PR 也是 Issue，这里把所有的 PR 过滤掉
async function getIssues() {
  const { data } = await listForRepo(repoInfo)
  return data.filter((s) => !s.pull_request)
}

async function commentIssue(issue: Issue, body: string) {
  await createComment({
    ...repoInfo,
    issue_number: issue.number,
    body: body,
  })
  if (CANCEL_SUB) {
    await deleteThreadSubscription({
      thread_id: issue.id,
    })
    console.log(`unsubscribed ${issue.title} successfully`)
  }
}

function getDate() {
  let date = new Date()
  const fillZero = (num: number) => (num < 10 ? `0${num}` : num)
  return `${date.getFullYear()}-${fillZero(date.getMonth() + 1)}-${fillZero(
    date.getDate()
  )}`
}

async function getIssueComments(issue: Issue) {
  return (
    await listComments({
      ...repoInfo,
      issue_number: issue.number,
    })
  ).data
}

async function isCommented(issue: Issue) {
  const comments = await getIssueComments(issue)
  return comments.some((s) => s.user!.login === username)
}

async function main() {
  const templateText = fs.readFileSync('template.md', 'utf-8').toString()

  const issueArray = (await getIssues()).filter((s) =>
    s.title.includes(getDate())
  )

  // if not issue, return
  if (issueArray.length === 0) return console.log('no issue')

  const issue = issueArray[0]

  // if already commented, return
  if (await isCommented(issue)) return console.log('already commented')

  await commentIssue(issue, templateText)
  console.log('commented successfully')
}

main()
