// function longestCommonPrefix(strs: string[]): string {
//   const res: Array<string> = [];
//   let count = 0;
//   if (strs.length > 1) {
//     for (let i = 0; i < String(strs[0]).length; i++) {
//       for (let j = 1; j < strs.length; j++) {
//         if (String(strs[0])[i] == String(strs[j])[i]) {
//           count++;
//           if (count == strs.length - 1) {
//             res.push(String(strs[0])[i]);
//             count = 0;
//           }
//         } else {
//           return res.join('');
//         }
//       }
//     }
//     return res.join('');
//   } else {
//     return strs.join('');
//   }
// }
// console.log(longestCommonPrefix(['aa', 'a']));

// function isValid(s: string): boolean {
//   const arr: Array<string> = [];
//   for (let i = 0; i < s.length; i++) {
//     if (
//       (s[i] == ')' && arr[arr.length - 1] != '(') ||
//       (s[i] == ']' && arr[arr.length - 1] != '[') ||
//       (s[i] == '}' && arr[arr.length - 1] != '{')
//     ) {
//       arr.push(s[i]);
//     }
//     if (s[i] == '(' || s[i] == '[' || s[i] == '{') {
//       arr.push(s[i]);
//     }
//     if (
//       (s[i] == ')' && arr[arr.length - 1] == '(') ||
//       (s[i] == ']' && arr[arr.length - 1] == '[') ||
//       (s[i] == '}' && arr[arr.length - 1] == '{')
//     ) {
//       arr.pop();
//     }
//   }

//   if (arr.length == 0) {
//     return true;
//   } else {
//     console.log(arr);
//     return false;
//   }
// }
// console.log(isValid('([])'));
