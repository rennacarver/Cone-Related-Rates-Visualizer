# Related Rates Visualizer (Cones)

[LIVE DEMO](https://rennacarver.github.io/Cone-Related-Rates-Visualizer/)

![Presentation1](https://github.com/user-attachments/assets/d23f2c4f-792b-472a-a4d6-bedab591a24e)

## Motivation

A lot of students struggle to see all of the moving parts of a differential equation. This visualizer takes one very common related rates problem (the filling of a cone) and animates the graphs and scenario to help students intuitively understand how rates and values are interconnected. When one value changes, all the other values change. And the rates at which they change are connected through the differential equation (which can be derived using implicit differentiation).

## Features

- Get comfortable with how formulas connect variables
- Connect the rates of those variables as time passes
- Modify the dimensions of the cone to see how the variables and rates are affected
- Light and Dark Theme

## Lessons Learned

- AI gets it wrong a lot but is a wonderful tool for learning a new framework, fixing small bugs, looking up documentation, and building small components
- AI is not always great with architecture but is great for small details
- Not all probjects need a framework like React or Angular
- Adding floating point numbers increases the complexity of the project and bugs 10x
- Intrinsic design for CSS requires a lot less media queiries keeping the code clean and simple

## Future Enhancements

- Detect user's system theme for default behavior
- Add constant volume option
- Add graph of rates as they change (derivative graph)
- Add additional shapes
- Allow user to change the liquid that fills the container

## Fixes

- The rates don't show when the animation is paused or the slider is manually moved
- The animation slider can glitch when moved to 0
