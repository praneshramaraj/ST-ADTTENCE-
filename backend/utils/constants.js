const CLASSES = ["IT-A", "IT-B", "IT-C", "IT-D", "ECE-A", "ECE-B", "CSE-A", "CSE-B", "AIDS-A", "AIDS-B", "AIDS-C", "AIML-A", "MECH-A"];

const DEPARTMENT_CLASS_MAP = {
  IT: ["IT-A", "IT-B", "IT-C", "IT-D"],
  ECE: ["ECE-A", "ECE-B"],
  CSE: ["CSE-A", "CSE-B"],
  AIDS: ["AIDS-A", "AIDS-B", "AIDS-C"],
  AIML: ["AIML-A"],
  MECH: ["MECH-A"]
};

const CLASS_PREFIX = {
  "IT-A": "ITA",
  "IT-B": "ITB",
  "IT-C": "ITC",
  "IT-D": "ITD",
  "ECE-A": "ECEA",
  "ECE-B": "ECEB",
  "CSE-A": "CSEA",
  "CSE-B": "CSEB",
  "AIDS-A": "AIDSA",
  "AIDS-B": "AIDSB",
  "AIDS-C": "AIDSC",
  "AIML-A": "AIMLA",
  "MECH-A": "MECHA"
};

const PERIOD_TIMINGS = [
  { periodNo: 1, startTime: "08:00", endTime: "08:40" },
  { periodNo: 2, startTime: "08:40", endTime: "09:20" },
  { periodNo: "Break", startTime: "09:20", endTime: "09:30" },
  { periodNo: 3, startTime: "09:30", endTime: "10:10" },
  { periodNo: 4, startTime: "10:10", endTime: "10:50" },
  { periodNo: "Lunch", startTime: "10:50", endTime: "11:30" },
  { periodNo: 5, startTime: "11:30", endTime: "12:10" },
  { periodNo: 6, startTime: "12:10", endTime: "12:50" },
  { periodNo: 7, startTime: "12:50", endTime: "13:30" },
  { periodNo: 8, startTime: "13:30", endTime: "14:10" },
  { periodNo: 9, startTime: "14:10", endTime: "14:50" }
];

module.exports = { CLASSES, DEPARTMENT_CLASS_MAP, CLASS_PREFIX, PERIOD_TIMINGS };
