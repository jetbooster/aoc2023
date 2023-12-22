import fs from 'fs'

Array(25).fill(0).forEach((_, index) => {
  const dayName = `day-${index + 1}`
  fs.mkdir(dayName, () => {
    fs.writeFileSync(`${dayName}/index.ts`, '')
  })
})
