// @ts-nocheck

import { Stack } from "./Stack";

let test = async function() {
  console.log(10 ** 30);



  let expression = "2+3*2-1";//[2,3,2,1003,1001,1,1002] gas 94541

  console.log(Formula.verify(expression));

  let list = Formula.midExpression(expression);
  let list2 = Formula.postExpression(list);

  console.log(list2);

  let s = Formula.math(list2);

  console.log(s);
};

export class Formula {
  public static math(list2: []) {
    let stack: Stack<string> = new Stack<string>();
    let indexYN = 0;
    let error: string = "";
    for (let i = 0; i < list2.length; i++) {
      if (this.isNumber(list2[i])) {
        if (list2[i].charAt(0) == "e") {
          stack.push(Math.E.toString());
        } else if (list2[i].charAt(0) == "p") {
          stack.push(Math.PI.toString());
        } else {
          stack.push(list2[i]);
        }
      } else if (this.isOperator(list2[i])) {
        let res = 0;
        if (list2[i] === "+") {
          let num2 = parseFloat(stack.pop());
          let num1 = parseFloat(stack.pop());
          res = num1 + num2;
        } else if (list2[i] === "-") {
          let num2 = parseFloat(stack.pop());
          let num1 = parseFloat(stack.pop());
          res = num1 - num2;
        } else if (list2[i] === "*") {
          let num2 = parseFloat(stack.pop());
          let num1 = parseFloat(stack.pop());
          res = num1 * num2;
        } else if (list2[i] === "/") {
          let num2 = parseFloat(stack.pop());
          let num1 = parseFloat(stack.pop());
          if (num2 !== 0) {
            res = num1 / num2;
          } else {
            error = "/ zero";
            indexYN = 1;
          }
        } else if (list2[i] === "^") {
          let num2 = parseFloat(stack.pop());
          let num1 = parseFloat(stack.pop());
          res = Math.pow(num1, num2);
        } else if (list2[i] === "!") {
          let num1 = parseFloat(stack.pop());
          if (num1 == 0 || num1 == 1) {
            res = 1;
          } else if (num1 == parseInt(num1) && num1 > 1) {
            let d = 1;
            for (let j = parseInt(num1); j > 0; j--) {
              d *= j;
            }
            res = d;
          } else {
            error = "Factorial must be a natural number";
            indexYN = 1;
          }
        } else if (list2[i] === "g") {
          let num1 = parseFloat(stack.pop());
          res = Math.sqrt(num1);
        } else if (list2[i] === "l") {
          let num1 = parseFloat(stack.pop());
          if (num1 > 0) {
            res = Math.log(num1);
          } else {
            error = "arg of ln must > 0";
            indexYN = 1;
          }
        } else if (list2[i] === "o") {
          let num1 = parseFloat(stack.pop());
          if (num1 > 0) {
            res = Math.log(num1) / Math.log(2);
          } else {
            error = "arg of log must > 0";
            indexYN = 1;
          }
        } else if (list2[i] === "s") {
          let num1 = parseFloat(stack.pop());
          res = Math.sin(num1);
        } else if (list2[i] === "c") {
          let num1 = parseFloat(stack.pop());
          res = Math.cos(num1);
        } else if (list2[i] === "t") {
          let num1 = parseFloat(stack.pop());
          if (Math.cos(num1) !== 0) {
            res = Math.tan(num1);
          } else {
            error = "arg of tan(x) must not be +-(π/2 + kπ)";
            indexYN = 1;
          }
        }
        stack.push("" + res);
      }
    }
    if (indexYN == 0) {
      if (!stack.isEmpty()) {
        return parseFloat(stack.pop());
      } else {
        return 0;
      }
    } else {
      return -999999;
    }
  }

  public static midExpression(str: string): string[] {
    let index = 0;
    let list: [] = [];
    do {
      let ch = str.charAt(index);
      if ("+-*/^!logsct()".indexOf(str.charAt(index)) >= 0) {
        index++;
        list.push(ch + "");
      } else if (str.charAt(index) == "e" || str.charAt(index) == "p") {
        index++;
        list.push(ch + "");
      } else if ("0123456789".indexOf(str.charAt(index)) >= 0) {
        let str1 = "";
        while (index < str.length && "0123456789.".indexOf(str.charAt(index)) >= 0) {
          str1 += str.charAt(index);
          index++;
        }
        list.push(str1);
      }
    } while (index < str.length);

    return list;
  }

  public static postExpression(list: []) {
    let optStack: Stack<string> = new Stack<string>();
    let list2 = [];
    if (list.length != 0) {
      for (let i = 0; i < list.length; i++) {
        if (this.isNumber(list[i])) {
          list2.push(list[i]);
        } else if (list[i].charAt(0) == "(") {
          optStack.push(list[i]);
        } else if (this.isOperator(list[i]) && list[i].charAt(0) !== "(") {
          if (optStack.isEmpty()) {
            optStack.push(list[i]);
          } else {
            if (list[i].charAt(0) !== ")") {
              if (this.adv(optStack.peek()) <= this.adv(list[i])) {
                optStack.push(list[i]);
              } else {
                while (!optStack.isEmpty() && "(" !== optStack.peek()) {
                  if (this.adv(list[i]) <= this.adv(optStack.peek())) {
                    list2.push(optStack.pop());
                  }
                }
                if (optStack.isEmpty() || optStack.peek().charAt(0) == "(") {
                  optStack.push(list[i]);
                }
              }
            } else if (list[i].charAt(0) == ")") {
              while (optStack.peek().charAt(0) !== "(") {
                list2.push(optStack.pop());
              }
              optStack.pop();
            }
          }
        }
      }
      while (!optStack.isEmpty()) {
        list2.push(optStack.pop());
      }
    }

    return list2;
  }

  public static isOperator(op: string): boolean {
    return "0123456789.ep".indexOf(op.charAt(0)) == -1;
  }

  public static isNumber(num: string): boolean {
    return "0123456789ep".indexOf(num.charAt(0)) >= 0;
  }

  //operator level
  public static adv(f: string): number {
    let result = 0;
    switch (f) {
      case "+":
        result = 1;
        break;
      case "-":
        result = 1;
        break;
      case "*":
        result = 2;
        break;
      case "/":
        result = 2;
        break;
      case "^":
        result = 3;
        break;
      case "!":
        result = 4;
        break;
      case "g":
        result = 4;
        break;
      case "l":
        result = 4;
        break;
      case "o":
        result = 4;
        break;
      case "s":
        result = 4;
        break;
      case "c":
        result = 4;
        break;
      case "t":
        result = 4;
        break;
    }
    return result;
  }

  public static verify(str: string): string {
    let i = 0;
    let indexYN;
    let error: string = this.verifyBracket(str);
    if (error != "") {
      return error;
    }

    if (str.length == 0) {
    }
    if (str.length == 1) {
      if ("0123456789ep".indexOf(str.charAt(0)) == -1) {
        error = "Input error!";
        indexYN = 1;
      }
    }
    if (str.length > 1) {
      for (i = 0; i < str.length - 1; i++) {
        if ("losctg(0123456789ep".indexOf(str.charAt(0)) == -1) {
          error = "Input error!";
          indexYN = 1;
        }
        if ("+-*/".indexOf(str.charAt(i)) >= 0 && "0123456789losctg(ep".indexOf(str.charAt(i + 1)) == -1) {
          error = "Input error!";
          indexYN = 1;
        }
        if (str.charAt(i) == "." && "0123456789".indexOf(str.charAt(i + 1)) == -1) {
          error = "Input error!";
          indexYN = 1;
        }
        if (str.charAt(i) == "!" && "+-*/^)".indexOf(str.charAt(i + 1)) == -1) {
          error = "Input error!";
          indexYN = 1;
        }
        if ("losctg".indexOf(str.charAt(i)) >= 0 && "0123456789(ep".indexOf(str.charAt(i + 1)) == -1) {
          error = "Input error!";
          indexYN = 1;
        }
        if (str.charAt(0) == "0" && str.charAt(1) == "0") {
          error = "Input error!";
          indexYN = 1;
        }
        if (i >= 1 && str.charAt(i) == "0") {
          //&& str.charAt(0) == '0' && str.charAt(1) == '0'
          let m = i;
          let n = i;
          let is = 0;
          if ("0123456789.".indexOf(str.charAt(m - 1)) == -1 && "+-*/.!^)".indexOf(str.charAt(i + 1)) == -1) {
            error = "Input error!";
            indexYN = 1;
          }
          if (str.charAt(m - 1) == "." && "0123456789+-*/.^)".indexOf(str.charAt(i + 1)) == -1) {
            error = "Input error!";
            indexYN = 1;
          }
          n -= 1;
          while (n > 0) {
            if ("(+-*/^glosct".indexOf(str.charAt(n)) >= 0) {
              break;
            }
            if (str.charAt(n) == ".") {
              is++;
            }
            n--;
          }

          if ((is == 0 && str.charAt(n) == "0") || "0123456789+-*/.!^)".indexOf(str.charAt(i + 1)) == -1) {
            error = "Input error!";
            indexYN = 1;
          }
          if (is == 1 && "0123456789+-*/.^)".indexOf(str.charAt(i + 1)) == -1) {
            error = "Input error!";
            indexYN = 1;
          }
          if (is > 1) {
            error = "Input error!";
            indexYN = 1;
          }

        }
        if ("123456789".indexOf(str.charAt(i)) >= 0 && "0123456789+-*/.!^)".indexOf(str.charAt(i + 1)) == -1) {
          error = "Input error!";
          indexYN = 1;
        }
        if (str.charAt(i) == "(" && "0123456789locstg()ep".indexOf(str.charAt(i + 1)) == -1) {
          error = "Input error!";
          indexYN = 1;
        }
        if (str.charAt(i) == ")" && "+-*/!^)".indexOf(str.charAt(i + 1)) == -1) {
          error = "Input error!";
          indexYN = 1;
        }
        if ("0123456789!)ep".indexOf(str.charAt(str.length - 1)) == -1) {
          error = "Input error!";
          indexYN = 1;
        }
        if (i > 2 && str.charAt(i) == ".") {
          let n = i - 1;
          let is = 0;
          while (n > 0) {
            if ("(+-*/^glosct".indexOf(str.charAt(n)) >= 0) {
              break;
            }
            if (str.charAt(n) == ".") {
              is++;
            }
            n--;
          }
          if (is > 0) {
            error = "Input error!";
            indexYN = 1;
          }
        }
        if ("ep".indexOf(str.charAt(i)) >= 0 && "+-*/^)".indexOf(str.charAt(i + 1)) == -1) {
          error = "Input error!";
          indexYN = 1;
        }
      }
    }
    return error;
  }

  public static verifyBracket(str: string): string {
    let khao = "";
    let leftkh = 0;
    let rightkh = 0;
    let m = 0;
    let error = "";
    let indexYN;
    for (let i = 0; i < str.length; i++) {
      if (str.charAt(i) == "(") {
        khao += "(";
        leftkh++;
      }
      if (str.charAt(i) == ")") {
        khao += ")";
        rightkh++;
      }
    }
    if (leftkh != rightkh) {
      error = "Input error! Bracket mismatch";
      indexYN = 1;
    }
    if ((leftkh == 0 && rightkh == 0) || ((leftkh == rightkh && leftkh > 0) && khao.charAt(0) == "(" && khao.charAt(khao.length - 1) == ")")) {
      if (indexYN == 0) {
        let list1: string[] = this.midExpression(str);
        //System.out.println(list1);
        let list2: string[] = this.postExpression(list1);
        //System.out.println(list2);
        if (indexYN == 0) {
          if (this.math(list2) == -999999) {
            // jTextField1.setText(jTextField1.getText());
          } else {
            error = this.math(list2);
            error = this.math(list2);
            error = this.math(list2);
          }
        }
      }
    } else {
      error = "Input error! Bracket mismatch";
      indexYN = 1;
    }
    return error;
  }
}



