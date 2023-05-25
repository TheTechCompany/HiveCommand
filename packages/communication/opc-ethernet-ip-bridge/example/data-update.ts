const child_tag = {a: false};
const tag = {a: true, key: 'a', children: [child_tag]};

const arr = [tag]

console.log(child_tag);
console.log(arr.find((a) => a.key === 'a')?.children)

child_tag.a = true;

console.log(child_tag);
console.log(arr.find((a) => a.key === 'a')?.children)
