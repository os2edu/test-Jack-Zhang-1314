import * as fs from "fs/promises"
import dayjs from "dayjs"
import { v1 } from "uuid"
import { getInput } from "@actions/core"
import { Octokit } from "@octokit/core"

const token = getInput("token") || process.env["GITHUB_TOKEN"]

const octokit = new Octokit({
  auth: token,
})

const res = await octokit.request('GET /repos/{owner}/{repo}/actions/workflows', {
  owner: 'os2edu',
  repo: 'test-Jack-Zhang-1314'
})
// console.log(res.data.workflows)
await fs.writeFile("workflows.json", JSON.stringify(res.data.workflows, null, 2))
// console.log(dayjs(res.data.workflows[0].created_at).format("YYYY-MM-DD HH:mm:ss"))

const runner = await octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
  owner: 'os2edu',
  repo: 'test-Jack-Zhang-1314'
})

// 最先完成的 classroom action
const classOne = runner.data.workflow_runs.find(item => item.path === ".github/workflows/classroom.yml")

// console.log(classOne)

await fs.writeFile("test.json", JSON.stringify(runner?.data, null, 2))

const message = {
  id: v1(),
  repoOwner: process.env["GITHUB_ACTOR"],
  repoURL: getInput("repoURL")
}

message.repoName = process.env["GITHUB_REPOSITORY"]
message.submitAt = dayjs(classOne.created_at).format("YYYY-MM-DD HH:mm:ss")
message.updateAt = dayjs(classOne.updated_at).format("YYYY-MM-DD HH:mm:ss")
const resReg = message.repoName?.replace(/.*\/(.*?)\-.*/g, "$1")

message.assignment = {
  title: resReg,
  description: resReg
}

console.log(message)

const jsonFile = `${message.repoOwner}_message.json`

await fs.writeFile(jsonFile, JSON.stringify(message, null, 2))
