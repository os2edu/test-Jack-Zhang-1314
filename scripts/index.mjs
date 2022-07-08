import * as fs from "fs/promises"
import dayjs from "dayjs"
import { v1 } from "uuid"
import { getInput } from "@actions/core"
import { exec } from "@actions/exec"
import { Octokit } from "@octokit/core"

const token = getInput("token") || process.env["GITHUB_TOKEN"]

const octokit = new Octokit({
  auth: token,
})

const repoName = process.env["GITHUB_REPOSITORY"] ?? "os2edu/test-Jack-Zhang-1314"


const runner = await octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
  owner: repoName.split("/")[0],
  repo: repoName.split("/")[1],
})


// 最先完成的 classroom action
const classOne = runner.data.workflow_runs
  .filter(item => item.path === ".github/workflows/classroom.yml")
  .find(item => item.conclusion === "success")

const classLast = runner.data.workflow_runs[runner.data.workflow_runs.length - 1]

//runner data
await fs.writeFile("test.json", JSON.stringify(runner?.data, null, 2))

//commmits total
let count

await exec("git", ["rev-list", "HEAD", "--count"], {
  listeners: {
    stdout: (data) => count = data.toString(),
    stderr: (data) => count = data.toString()
  }
})

const message = {
  id: v1().split("-")[0],
  repoOwner: process.env["GITHUB_ACTOR"],
  repoURL: getInput("repoURL"),
  repoName,
  submitAt: dayjs(classLast.created_at).format("YYYY-MM-DD HH:mm:ss"),
  updateAt: dayjs(classOne?.updated_at ?? classLast.updated_at).format("YYYY-MM-DD HH:mm:ss"),
  passed: classOne?.conclusion ?? "failure",
  commitsCount: count.trim(),
}

const resReg = message.repoName?.replace(/.*\/(.*?)\-.*/g, "$1")

message.assignment = {
  id: v1().split("-")[0],
  title: resReg,
  description: resReg
}

// students' information
const jsonFile = `${message.repoOwner}_message.json`

await fs.writeFile(jsonFile, JSON.stringify(message, null, 2))
