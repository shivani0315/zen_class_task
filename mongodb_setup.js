// Use the database
 use zen_class_programme

// Create Collections
db.createCollection("users")
db.createCollection("codekata")
db.createCollection("attendance")
db.createCollection("topics")
db.createCollection("tasks")
db.createCollection("company_drives")
db.createCollection("mentors")

// Insert Sample Data

// Users Collection
db.users.insertMany([
  { _id: ObjectId(), name: "Shiv", user_id: 1, placement: true },
  { _id: ObjectId(), name: "John", user_id: 2, placement: false },
  { _id: ObjectId(), name: "Jane", user_id: 3, placement: true }
])

// Codekata Collection
db.codekata.insertMany([
  { user_id: 1, problems_solved: 150 },
  { user_id: 2, problems_solved: 100 },
  { user_id: 3, problems_solved: 80 }
])

// Attendance Collection
db.attendance.insertMany([
  { user_id: 1, date: new Date("2020-10-16"), status: "present" },
  { user_id: 2, date: new Date("2020-10-17"), status: "absent" },
  { user_id: 3, date: new Date("2020-10-18"), status: "present" }
])

// Topics Collection
db.topics.insertMany([
  { topic_id: 1, name: "JavaScript Basics", date: new Date("2020-10-05") },
  { topic_id: 2, name: "ReactJS", date: new Date("2020-10-20") }
])

// Tasks Collection
db.tasks.insertMany([
  { task_id: 1, name: "Build a React App", date: new Date("2020-10-06") },
  { task_id: 2, name: "Implement Redux", date: new Date("2020-10-21") }
])

// Company Drives Collection
db.company_drives.insertMany([
  { company_name: "Google", drive_date: new Date("2020-10-16"), user_id: [1, 3] },
  { company_name: "Microsoft", drive_date: new Date("2020-10-28"), user_id: [1] }
])

// Mentors Collection
db.mentors.insertMany([
  { mentor_id: 1, name: "Alice", mentee_count: 20 },
  { mentor_id: 2, name: "Bob", mentee_count: 10 }
])

// Queries
// 1. Find all topics and tasks taught in October
db.topics.find({ date: { $gte: ISODate("2020-10-01"), $lte: ISODate("2020-10-31") } })
db.tasks.find({ date: { $gte: ISODate("2020-10-01"), $lte: ISODate("2020-10-31") } })

// 2. Find company drives between 15-Oct-2020 and 31-Oct-2020
db.company_drives.find({ drive_date: { $gte: ISODate("2020-10-15"), $lte: ISODate("2020-10-31") } })

// 3. Find company drives and students who attended the placement
db.company_drives.aggregate([
  { $lookup: {
      from: "users",
      localField: "user_id",
      foreignField: "user_id",
      as: "students"
    }
  }
])

// 4. Find the number of problems solved by each user in Codekata
db.codekata.find({}, { user_id: 1, problems_solved: 1 })

// 5. Find mentors with more than 15 mentees
db.mentors.find({ mentee_count: { $gt: 15 } })

// 6. Find users who were absent and did not submit tasks between 15-Oct-2020 and 31-Oct-2020
db.attendance.aggregate([
  { $match: { date: { $gte: ISODate("2020-10-15"), $lte: ISODate("2020-10-31") }, status: "absent" } },
  { $lookup: {
      from: "tasks",
      let: { userId: "$user_id" },
      pipeline: [
        { $match: {
            $expr: {
              $and: [
                { $eq: ["$user_id", "$$userId"] },
                { $gte: ["$date", ISODate("2020-10-15")] },
                { $lte: ["$date", ISODate("2020-10-31")] }
              ]
            }
          }
        }
      ],
      as: "task_submission"
    }
  },
  { $match: { "task_submission": { $eq: [] } } }
])
