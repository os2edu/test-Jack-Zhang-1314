import * as fs from "fs/promises"
import dayjs from "dayjs"
import { v1 } from "uuid"
import { getInput } from "@actions/core"

const message = {
  id: v1(),
  repoOwner: process.env["GITHUB_ACTOR"],
  repoURL: getInput("repoURL")
}

let repoName = process.env["GITHUB_REPOSITORY"]

message.repoName = repoName

message.commitTime = dayjs().format("YYYY-MM-DD HH:mm:ss")

// console.log(process.env)

const res = repoName?.replace(/.*\/(.*?)\-.*/g, "$1")

message.assignment = {
  title: res,
  description: res
}
console.log(message)

const jsonFile = `${message.repoOwner}_test.json`

await fs.writeFile(jsonFile, JSON.stringify(message))