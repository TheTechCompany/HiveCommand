import Controller from "node-pid-controller";

const controller = new Controller({
	k_p: 0.5,
	k_i: 0.01,
	k_d: 0.01,
	dt: 1
})


//12L/min
controller.setTarget(12)

let output = 1;


let goalReached = false
let i = 0;

// while (!goalReached) {
//   let input  = controller.update(output);
//   console.log(output)
//   output += input;
//   goalReached = (input === 0) ? true : false; // in the case of continuous control, you let this variable 'false'
// 	i += 1;
// }

const cycleTick = () => {
	let input = controller.update(output)

	setTimeout(() => output += input, 2000)

	console.log(output)

	setTimeout(cycleTick, 1000)
}

cycleTick()