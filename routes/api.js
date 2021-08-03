const express = require("express");
const db = require('../models');
const mongoose = require("mongoose");
const { ObjectId } = require('mongodb');
const router = express.Router();

router.route("/api/workouts")
  //GET: return all the workouts
  .get((req,res) => {
    db.Workout.aggregate([
      {
        $addFields: {
          totalDuration: {
            $sum: '$exercises.duration',
          },
        },
      },
    ])
      .then((workouts) => {
        res.json(workouts);
      })
    .catch(err => {
      res.json(err);
    });
  })
  
    
  // POST: post a single workout to database
  .post((req,res) => {
    db.Workout.create({}, function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        res.json(doc);
      }
    })
  })


router.put('/api/workouts/:id', async (req,res) => {
  db.Workout.findOneAndUpdate({_id: req.params.id}, {$push: {exercises: req.body}})
  .then(dbWorkout => {
    res.json(dbWorkout);
  })
  .catch(err => {
    res.json(err);
  });
})


router.get("/api/workouts/range", (req,res) => {
  // example of finding items between date
  db.Workout.aggregate([
    {
      $addFields: {
        totalDuration: {
          $sum: '$exercises.duration',
        },
      },
    },
  ])
  .limit(7)
    .then((workouts) => {
      res.json(workouts);
    })
.catch(err => {
    res.json(err);
  });
});

module.exports = router;



// create cardio exercise and add to workout collection
function handleCardioUpdate(type, name, distance, duration, workoutID) {
  return new Promise((resolve,reject) => {
    let exercise_id;

    if (containsNull([name, distance, duration])) {
      return reject("field contains null value");
    }

    db.Exercise.create({type: type, name: name, distance: distance, duration: duration}, function(err, doc) {
      if (err) {
        return reject(err);
      } else {
        console.log(doc);
        exercise_id = doc._id;
        db.Workout.updateOne({_id: workoutID}, {$push: {exercises: exercise_id}, $inc: {totalDuration: duration}}, function(err, res) {
          if (err) {
            return reject("Could not update Workout Collection");
          }
          return resolve("Added Exercise Successfully");
        });
      }
    });
  })
}


// create resistance exercise and add to workout collection
function handleResistanceUpdate(type, name, weight, sets, reps, duration, workoutID) {
  return new Promise((resolve,reject) => {
    let exercise_id;

    if (containsNull([name, weight, sets, reps, duration])) {
      return reject("field contains null value");
    }

    db.Exercise.create({type: type, name: name, weight: weight, sets: sets, reps: reps, duration: duration}, function(err, doc) {
      if (err) {
        return reject(err);
      } else {
        console.log(doc);
        exercise_id = doc._id;
        db.Workout.updateOne({_id: workoutID}, {$push: {exercises: exercise_id}, $inc: {totalDuration: duration}}, function(err, res) {
          if (err) {
            return reject("Could not update Workout Collection");
          }
          return resolve("Added Exercise Successfully");
        });
      }
    });
  })
}