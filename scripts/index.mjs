import { get_workflow_id, get_languages, getJobs, get_commits, get_branch_total, repoName } from './data.mjs'
import * as fs from "fs/promises"

const [workflow, languages, commitsTotal, branches] = await Promise.all([get_workflow_id(), get_languages(), get_commits(), get_branch_total()])

function workflow_runs() {
  workflow.slice[0, 3]?.map(item => {
    return {
      id: item.id,
      name: item.name,
      event: item.event,
      conclusion: item.conclusion,
      status: item.status,
      check_suite_id: item.check_suite_id,
      head_branch: item.head_branch,
      html_url: item.html_url,
      run_started_at: item.started_at,
      created_at: item.created_at,
    }
  })
}

async function latestRunJobs() {
  const run = await getJobs(workflow[0].id)
  return {
    id: run.jobs[0].run_id,
    name: run.jobs[0].name,
    html_url: run.jobs[0].html_url,
    conclusion: run.jobs[0].conclusion,
    status: run.jobs[0].status,
    completed_at: run.jobs[0].completed_at,
    started_at: run.jobs[0].started_at,
    steps: run.jobs[0].steps,
  }
}

const runJobs = await latestRunJobs()

const workflows_msg = workflow.map(run => ({
  branch: run.head_branch,
  name: run.actor.login,
  avatar: run.actor.avatar_url,
  studentInfo: {
    avatar_url: run.actor.avatar_url
  },
  repo: {
    id: run.repository.id,
    name: run.repository.name,
    owner: {
      login: run.repository.owner.login,
      avatar_url: run.repository.owner.avatar_url,
      html_url: run.repository.owner.html_url
    },
    private: run.repository.private,
    html_url: run.repository.html_url,
    pushed_at: "not found",
    created_at: run.created_at,
    updated_at: run.updated_at
  },
  repoUrl: run.repository.html_url,
  commits: commitsTotal,
  isScuccess: run.conclusion,
  languages,
  latestRunJobs: runJobs,
  runs: workflow_runs(),
  executeTime: "not found",
  submission_timestamp: run.head_commit.timestamp,
  points_awarded: run.conclusion === "success" ? 100 : 0,
  points_available: run.conclusion === "success" ? 100 : 0,
}))

const assignments = branches
  .map(branch => ({ branch: branch.name, title: branch.name, student_repositories: [] }))
  .map(item => {
    // workflows_msg.forEach(workflow => {
    //   if (workflow.branch === item.branch) {
    //     item.student_repositories.push(workflow)
    //   }
    // })
    item.student_repositories.push(workflows_msg.find(workflow => {
      return workflow.branch === item.branch
    }))
    return item
  })

await fs.writeFile(`${process.env["GITHUB_ACTOR"]}.json`, JSON.stringify(assignments, null, 2))