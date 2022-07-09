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


const classTotal = runner.data.workflow_runs
  .filter(item => item.path === ".github/workflows/classroom.yml" && item.conclusion === "success")

// success:last classroom action
const classLast = classTotal[0]

// success:one classroom action
const classOne = classTotal[classTotal.length - 1]


//runner data
// await fs.writeFile("classSuccess.json", JSON.stringify({ classTotal }, null, 2))

//commmits total
let count

try {
  await exec("git", ["rev-list", "HEAD", "--count"], {
    listeners: {
      stdout: (data) => count = data.toString(),
      stderr: (data) => count = data.toString()
    }
  })
} catch (error) {
  console.log(error)
  console.log("failure")
}

const message = {
  id: v1().split("-")[0],
  repoOwner: process.env["GITHUB_ACTOR"],
  repoURL: getInput("repoURL"),
  repoName,
  submitAt: dayjs(classOne?.created_at).format("YYYY-MM-DD HH:mm:ss"),
  updateAt: dayjs(classLast?.updated_at ?? new Date()).format("YYYY-MM-DD HH:mm:ss"),
  passed: classOne?.conclusion ?? "failure",
  commitsCount: count.trim(),
}

if (!classOne) {
  message.submitAt = null
}

const resReg = message.repoName?.replace(/.*\/(.*?)\-.*/g, "$1")

message.assignment = {
  id: v1().split("-")[0],
  title: resReg,
  description: resReg
}

// console.log(message)

// students' information
const jsonFile = `${message.repoOwner}_message.json`

try {
  await fs.writeFile(jsonFile, JSON.stringify(message, null, 2))
} catch (error) {
  console.log(error)
  console.log("failure")
}
