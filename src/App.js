import React, { Component } from 'react';
import './App.css';
import Display from './Display';
import Math from 'mathjs';

// variable declaration and initialisation.
var trigDisplay = "";
var boolClear = true;
var stackVal1 = 1;
var stackVal2 = 0;
var strMathError = "Math Error";
var strEmpty = 0;
var maxLength = 8;
var openArray = [];
var displayString = "";
var opCode = 0;
var newOpCode = 0;
var opCodeArray = [];
var stackVal = 0;
var stackArray = [];
var trig = 0;
var strNaN = "NaN";
var strInf = "Infinity";
var oscError = "ERROR";
var modeSelected = "deg"
var memory = 0;

//state initialisation
class App extends Component {
  constructor() {
    super()
    this.state = {
      inBox: [strEmpty],
      inBox1: [],
      mem: "hide",
      selectedOption: "deg",
      display: "block",
      displayText: "none",
      minimize: "ui-widget-content calc_container",
      displayMain: "block",
      header: "",
      displayMax: 'none',
    }
  }


  //when numeric buttons pressed
  buttonNumeric = (e) => {
    var value = e.target.getAttribute('value');
    var inBoxVal = this.state.inBox.join('');
    var inBox1Val = this.state.inBox1.join('');
    if (inBoxVal.indexOf("Infinity") > -1 || inBoxVal.indexOf(strMathError) > -1) return;  //checks if the input box is inifinity
    if (boolClear) {
      inBoxVal = "0";
      boolClear = false;
    }
    var str = inBoxVal;
    if (str.length > maxLength) return;
    if (value === "." && str.indexOf('.') >= 0 && inBox1Val.length !== 0) {
      this.setState({
        inBox: [strEmpty + "."],
        inBox1: [],
      });
      return;
    }
    else if (value === "." && str.indexOf('.') >= 0)
      return;
    this.displayCheck();

    if (parseInt(str) !== strEmpty || str.length > 1 || value === ".") {
      this.setState({
        inBox: [str + value],
      });
      stackVal1 = 1;
    }
    else {
      this.setState({
        inBox: [value],
      });
      stackVal1 = 1;
    }
    
  }

  //when constants are pressed
  buttonConst = e => {         
    var retVal = strEmpty; 
    var value = e.target.getAttribute('value');
    var inBoxVal = this.state.inBox.join('');
    if (inBoxVal.indexOf("Infinity") > -1 || inBoxVal.indexOf(strMathError) > -1) return;
    switch (value) {
      case "p": retVal = Math.PI;
        break;
      case "keyPad_btnE": retVal = Math.E;
        break;
      default: break;
    }

    this.displayCheck();
    stackVal1 = 1;
    boolClear = true;
    if (retVal !== strEmpty) {
      this.setState({
        inBox: [retVal],
      });
    } else {
      this.setState({
        inBox: [retVal],
      });
    }

  }

  //When binary operators are pressed.
  btnBinary = async (e) => {
    var value = e.target.getAttribute('value');
    var inBoxVal = this.state.inBox.join('');
    var inBox1Val = this.state.inBox1.join('');
    if (inBoxVal.indexOf("Infinity") > -1 || inBoxVal.indexOf(strMathError) > -1) return;
    switch (value) {
      case '+': this.stackCheck(value);
        newOpCode = 1;
        if (opCode === 10 && stackArray.length > 0 && stackArray[stackArray.length - 1] === '{')
          this.opcodeChange();
        await this.operation();
        stackVal1 = 0;

        break;
      case '-': this.stackCheck(value);
        newOpCode = 2;
        if (opCode === 10 && stackArray.length > 0 && stackArray[stackArray.length - 1] === "{")
          this.opcodeChange();
        await this.operation();
        stackVal1 = 0;
        break;
      case '*': await this.stackCheck(value);
        newOpCode = 3;
        if (opCode === 1 || opCode === 2) {
          this.opcodeChange();
        }
        if (opCode === 10) {
          if (opCodeArray[opCodeArray.length - 1] < 3 || (stackArray.length > 0 && stackArray[stackArray.length - 1] === "{")) {
            this.opcodeChange();
          }
          else {
            await this.operation();
          }
        }
        stackVal1 = 0;
        break;
      case '/': this.stackCheck(value);
        newOpCode = 4;
        if (opCode < 4 && opCode) {
          this.opcodeChange();
        }
        if (opCode === 10) {
          if (opCodeArray[opCodeArray.length - 1] < 4 || stackVal1 === 5 || (stackArray.length > 0 && stackArray[stackArray.length - 1] === "{")) {
            this.opcodeChange();
          }
          else {
            await this.operation();
          }
        }
        stackVal1 = 0;
        break;
      case '%': this.stackCheck("%");
        newOpCode = 11;
        if (opCode < 6 && opCode) {
          this.opcodeChange();
        }
        if (opCode === 10) {
          if (opCodeArray[opCodeArray.length - 1] < 6 || (stackArray.length > 0 && stackArray[stackArray.length - 1] === "{")) {
            this.opcodeChange();
          }
          else {
            await this.operation();
          }
        }
        stackVal1 = 0;
        break;

      case 'EXP': this.stackCheck("e+0");
        newOpCode = 9;
        if (opCode < 6 && opCode) {
          this.opcodeChange();
        }
        if (opCode === 10) {
          if (opCodeArray[opCodeArray.length - 1] < 6 || (stackArray.length > 0 && stackArray[stackArray.length - 1] === "{")) {
            this.opcodeChange();
          }
          else {
            await this.operation();
          }
        }
        stackVal1 = 1;
        stackVal2 = 7;
        break;
      case 'XpowY': this.stackCheck("^");
        newOpCode = 6; if (opCode < 6 && opCode) {
          this.opcodeChange();
        }
        if (opCode === 10) {
          if (opCodeArray[opCodeArray.length - 1] < 6 || (stackArray.length > 0 && stackArray[stackArray.length - 1] === "{")) {
            this.opcodeChange();
          }
          else {
            await this.operation();
          }
        }
        stackVal1 = 0;
        break;
      case 'mod': this.stackCheck(value);
        newOpCode = 5;
        if (opCode === 1 || opCode === 2) {
          this.opcodeChange();
        }
        if (opCode === 10) {
          if (opCodeArray[opCodeArray.length - 1] === 1 || 2 || (stackArray.length > 0 && stackArray[stackArray.length - 1] === "{")) {
            this.opcodeChange();
          }
          else {
            await this.operation();
          }
        }
        stackVal1 = 0;
        break;
      case 'YrootX':
        this.stackCheck("yroot");
        newOpCode = 7;
        if (opCode < 6 && opCode) {
          this.opcodeChange();
        }
        if (opCode === 10) {
          if (opCodeArray[opCodeArray.length - 1] < 6 || (stackArray.length > 0 && stackArray[stackArray.length - 1] === "{")) {
            this.opcodeChange();
          }
          else {
            await this.operation();
          }
        }
        stackVal1 = 0;
        break;
      case 'YlogX': this.stackCheck("logxBasey");
        newOpCode = 8;
        if (opCode === 1 || opCode === 2) {
          this.opcodeChange();
        }
        if (opCode === 10) {
          if (opCodeArray[opCodeArray.length - 1] < 3 || (stackArray.length > 0 && stackArray[stackArray.length - 1] === "{")) {
            this.opcodeChange();
          }
          else {
            await this.operation();
          }
        }
        stackVal1 = 0;
        break;
      case '(': displayString = inBox1Val + value;
        newOpCode = 0;
        this.setState({
          inBox: [0],
        });
        if (opCode !== 0) {
          this.opcodeChange();
        }
        openArray.push("{");
        stackArray.push("{");
        stackVal1 = 1;
        break;
      case ')': if (stackVal2 === 6) {
        stackVal = parseFloat(inBoxVal);
        displayString = inBox1Val + inBoxVal + value;
      }
      else if (newOpCode !== 10) {
        if (stackVal1 !== 3) {
          if ((inBox1Val.indexOf("e+0") > -1) && inBoxVal.indexOf("-") > -1)
            this.setState({
              inBox1: [inBox1Val.replace("e+0", "e")],
            });
          else if ((inBox1Val.indexOf("e+0") > -1))
            this.setState({
              inBox1: [inBox1Val.replace("e+0", "e+")],
            });
          inBox1Val = this.state.inBox1.join('');
          displayString = inBox1Val + inBoxVal + value;
        }
        else
          displayString = inBox1Val + value;
      }
      else {
        displayString = inBox1Val + value;
      }
        if (openArray[0]) {
          openArray.pop();
          newOpCode = 10;
          while (opCodeArray[0] || openArray[0]) {
            if (stackArray[stackArray.length - 1] === "{") {
              stackArray.pop();
              break;
            }
            else {
              await this.oscBinaryOperation();
              stackVal = stackArray[stackArray.length - 1];
              if (stackVal === "{") {
                stackArray.pop();
                opCode = 0;
                break;
              }
              stackArray.pop();
              opCode = opCodeArray[opCodeArray.length - 1];
              opCodeArray.pop();
              if (!opCodeArray[0] && stackArray.length > 0 && stackArray[stackArray.length - 1] !== "{")  //if length is 0 then below statement gives error...
              {
                stackVal = stackArray[stackArray.length - 1];
              }
            }
          }
        }
        else {
          return;
        }
        stackVal2 = 1;
        stackVal1 = 5;
        break;
      case 'percent':
        if (opCode === 1 || opCode === 2) {
          var upDinbox = stackVal * parseFloat(inBoxVal) / 100;
          this.setState({
            inBox: [upDinbox],
          });
        }
        else if (opCode === 3 || opCode === 4) {
          var upD_inbox = parseFloat(inBoxVal) / 100;
          this.setState({
            inBox: [upD_inbox],
          });
        }
        else return;
        break;
      default: break;
    }
    if (opCode) {
      await this.oscBinaryOperation();
    }
    else {

      stackVal = parseFloat(this.state.inBox.join(''));
      boolClear = true;
    }
    opCode = newOpCode;
    this.setState({
      inBox1: [displayString],
    });
  }

  //Memory functions.
  btnMemory = e => {
    var value = e.target.getAttribute('value');
    var inBoxVal = this.state.inBox.join('');
    var x = parseFloat(inBoxVal);
    if (inBoxVal === "") {
      x = 0;
    }
    var retVal = 0;
    if (inBoxVal.indexOf("Infinity") > -1 || inBoxVal.indexOf(strMathError) > -1) return;
    switch (value) {
      case 'MS': memory = x;
        this.setState({
          mem: "show",
        })
        retVal = inBoxVal;
        break;
      case 'M+': memory = x + parseFloat(memory);
        this.setState({
          mem: "show",
        })
        retVal = inBoxVal;
        break;
      case 'MR': retVal = parseFloat(memory);
        stackVal1 = 1;
        break;
      case 'MC': memory = 0;
        this.setState({
          mem: "hide",
        })
        retVal = inBoxVal;
        break;
      case 'M-': this.setState({
        mem: "show",
      })
        memory = parseFloat(memory) - x;
        retVal = inBoxVal;
        break;
      default: break;

    }
    if (retVal !== strEmpty) {
      this.setState({
        inBox: [retVal],
      })
    } else {
      this.setState({
        inBox: [retVal],
      })
    }
    boolClear = true;


  }

  //Check the stack - to check which operator or symbol is present on top of the stack.
  stackCheck = async (text) => {
    var inBox1Val = this.state.inBox1.join('');
    var inBoxVal = this.state.inBox.join('');
    var upDinbox1 = inBox1Val;
    if (stackVal1 === 2) {
      inBox1Val = "";
    }
    if (stackVal1 === 0) {
      opCode = 0;
      var x = 1;
      switch (newOpCode) {
        case 5: x = 3;
          break;
        case 7: x = 5;
          break;
        case 8: x = 9;
          break;
        default: break;

      }


      if (!(inBox1Val.indexOf("e+") > -1)) {
        upDinbox1 = inBox1Val.substring(0, inBox1Val.length - x);
        this.setState({
          inBox1: [upDinbox1],
        }, () => {
          inBox1Val = this.state.inBox1.join('');
        });

      }

      stackVal2 = 2;
    }

    if (stackVal1 === 5 || stackVal2 === 2) {
      inBox1Val = this.state.inBox1.join('');
      stackVal2 = 0;
      displayString = upDinbox1 + text;
    }
    else {
      if (inBox1Val.indexOf("e+0") > -1 && inBoxVal.indexOf("-") > -1)
        upDinbox1 = inBox1Val.replace("e+0", "e");
      else if ((inBox1Val.indexOf("e+0") > -1))
        upDinbox1 = inBox1Val.replace("e+0", "e+");
      displayString = upDinbox1 + inBoxVal + text;
    }
  }

  //Perform calculation operation.
  operation = async () => {
    while (opCodeArray[0] && opCode) {
      if (opCode === 10) {
        opCode = opCodeArray[opCodeArray.length - 1];
        stackVal = stackArray[stackArray.length - 1];
        if (newOpCode === 1 || newOpCode === 2 || newOpCode <= opCode) {
          opCodeArray.pop();
          stackArray.pop();
        }
        else {
          opCode = 0;
          break;
        }
      }
      else if (stackArray[stackArray.length - 1] === "{") {
        break;
      }
      else {
        await this.oscBinaryOperation();
        stackVal = stackArray[stackArray.length - 1];
        if (stackVal === "{") {
          opCode = 0;
          break;
        }
        opCode = opCodeArray[opCodeArray.length - 1];
        if (newOpCode === 1 || newOpCode === 2 || newOpCode <= opCode) {
          opCodeArray.pop();
          stackArray.pop();
        }
        else {
          opCode = 0;
          break;
        }
        if (!opCodeArray[0] && stackArray.length > 0 && stackArray[stackArray.length - 1] !== "{")  //if length is 0 then below statement gives error...
        {
          stackVal = stackArray[stackArray.length - 1];
        }
      }
    }
  }

  //Change the operation code depending on the symbol on top of the stack.
  opcodeChange = async () => {
    if (opCode !== 10 && opCode !== 0) {
      opCodeArray.push(opCode);
      stackArray.push(stackVal);
    }
    if (opCode === 0) {
      stackArray.push(stackVal);
    }
    opCode = 0;
  }


  //Check the values in the display.
  displayCheck = async () => {
    var inBox1Val = this.state.inBox1.join('');
    switch (stackVal1) {
      case 2: this.setState({
        inBox1: [],
      });
        break;
      case 3: var upDinbox1 = inBox1Val.substring(0, inBox1Val.length - trigDisplay.length);
        this.setState({
          inBox1: [upDinbox1],
        });
        stackVal2 = 4;
        break;
      case 5: var string = "";
        for (var i = openArray.length; i >= 0; i--) {
          string = string + displayString.substring(0, displayString.indexOf("(") + 1);
          displayString = displayString.replace(string, "");
        }
        displayString = string.substring(0, string.lastIndexOf("("));
        this.setState({
          inBox1: [displayString]
        });
        stackVal2 = 6;
        break;

      default: break;
    }
  }

  //Perform binary operations
  oscBinaryOperation = () => {
    var inBoxVal = this.state.inBox.join('');
    var x2 = parseFloat(inBoxVal);
    var retVal = 0;
    switch (opCode) {
      case 9: stackVal = parseFloat(stackVal) * Math.pow(10, x2);
        break;
      case 1: stackVal += x2;
        break;
      case 2: stackVal -= x2;
        break;
      case 3: stackVal *= x2;
        break;
      case 4: stackVal /= x2;
        break;
      case 6: var precisioncheck = stackVal;
        stackVal = Math.pow(stackVal, x2);
        if (precisioncheck === 10 && stackVal % 10 !== 0 && (Math.abs(stackVal) < 0.00000001 || Math.abs(stackVal) > 100000000) && x2 % 1 === 0)
          stackVal = stackVal.toPrecision(7);
        break;
      case 5: stackVal = stackVal % x2;
        break;
      case 7: stackVal = this.nthroot(stackVal, x2); break;
      case 8: stackVal = Math.log(stackVal) / Math.log(x2);
        break;
      case 11: stackVal = stackVal / 100 * x2;
        break;
      case 0: stackVal = x2;
        break;
      default: break;
    }
    retVal = stackVal;
    if (Math.abs(retVal) < 0.00000001 || Math.abs(retVal) > 100000000) {

    }
    else {
      if (retVal.toFixed(8) % 1 !== 0) {
        var i = 1;
        while (i < 10) {
          if ((retVal.toFixed(i) !== 0) && (retVal.toFixed(i) / retVal.toFixed(i + 8) === 1)) {
            retVal = retVal.toFixed(i);
            break;
          }
          else {
            i++;
          }
        }
      }
      else {
        retVal = retVal.toFixed(0);
      }
    }
    this.setState({
      inBox: [retVal],
  
    });
    boolClear = true;
    trig = 0;
    
  }



  //When unary operators are pressed.
  btnUnaryOp = async (e) => {
    var value = e.target.getAttribute('value');
    var inBoxVal = this.state.inBox.join('');
    var x = parseFloat(inBoxVal);
    var retVal = oscError;
    if (inBoxVal.indexOf("Infinity") > -1 || inBoxVal.indexOf(strMathError) > -1) return;
    switch (value) {
      //+/-
      case "+/-": retVal = -x; trig = 1; stackVal2 = 3; break;
      //1/x
      case "1/x": retVal = 1 / x; this.displayTrignometric("reciproc", x); break;
      //x^2
      case "x^2": retVal = x * x; this.displayTrignometric("sqr", x); break;
      //SQRT(x)
      case "sqrt": if (x >= 0) {
        retVal = Math.sqrt(x);
        this.displayTrignometric("sqrt", x);
      } else {
        retVal = NaN;
        this.displayTrignometric("sqrt", x);
      } break;
      // X^3                                 
      case "xCube":
        retVal = x * x * x; this.displayTrignometric("cube", x); break;            // POW (X, 1/3)                                 
      case "cbrt": retVal = this.nthroot(x, 3); this.displayTrignometric("cuberoot", x); break;
      // NATURAL LOG                                 
      case "ln": if (x >= 0) {
        retVal = Math.log(x);
        this.displayTrignometric(value, x);
      } else {
        retVal = NaN;
        this.displayTrignometric(value, x);
      } break;
      // LOG BASE 10                                 
      case "log": retVal = Math.log(x) / Math.LN10; this.displayTrignometric(value, x); break;
      // E^(X)                                 
      case "exp": retVal = Math.exp(x); this.displayTrignometric("powe", x); break;
      // SIN                                 
      case "sin": retVal = this.sinCalc(modeSelected, x); this.modeText(value, x); trig = 1; break;
      // COS                                 
      case "cos": retVal = this.cosCalc(modeSelected, x); this.modeText(value, x); trig = 1; break;
      // TAN                                 
      case "tan": retVal = this.tanCalc(modeSelected, x); this.modeText(value, x); trig = 1; break;
      // CTG                                 


      //Factorial
      case "fact": 
        retVal = this.factorial(x);
        this.displayTrignometric("fact", x);
        break;

      //10^x
      case "10^x": retVal = Math.pow(10, x);
        if (retVal % 10 !== 0 && (Math.abs(retVal) < 0.00000001 || Math.abs(retVal) > 100000000) && (x % 1 === 0))
          retVal = retVal.toPrecision(7);
        this.displayTrignometric("powten", x); break;

      //AsinH
      case "sinh-1": retVal = this.inverseSineH(x); this.modeText(value, x); break;

      //AcosH
      case "cosh-1": if (x >= 1) {
        retVal = Math.log(x + Math.sqrt(x + 1) * Math.sqrt(x - 1)); this.modeText(value, x);
      } else {
        retVal = NaN;
        this.modeText(value, x);
      } break;

      //AtanH
      case "tanh-1": retVal = 0.5 * (Math.log(1 + x) - Math.log(1 - x)); this.modeText(value, x); break;

      //Absolute |x|
      case "abs": retVal = Math.abs(x); this.displayTrignometric("abs", x); break;

      //Log Base 2
      case "logbase2": retVal = Math.log(x) / Math.log(2);
        this.displayTrignometric("logXbase2", x);
        
        break;
      case 'sin-1': retVal = this.sinInvCalc(modeSelected, x); this.modeText("asin", x); trig = 1;
        break;

      case 'cos-1': retVal = this.cosInvCalc(modeSelected, x); this.modeText("acos", x); trig = 1;
        break;

      case 'tan-1': retVal = this.tanInvCalc(modeSelected, x); this.modeText("atan", x); trig = 1;
        break;

      case 'sinh': retVal = (Math.pow(Math.E, x) - Math.pow(Math.E, -x)) / 2;
        this.modeText(value, x);
        break;

      case 'cosh': retVal = (Math.pow(Math.E, x) + Math.pow(Math.E, -x)) / 2;
        this.modeText(value, x);
        break;

      case 'tanh':
        retVal = (Math.pow(Math.E, x) - Math.pow(Math.E, -x));
        retVal /= (Math.pow(Math.E, x) + Math.pow(Math.E, -x));
        this.modeText(value, x);
        break;

      default: break;

    }
    if (stackVal2 === 1) {
      stackVal = retVal;
    }
    if (stackVal2 !== 3) { stackVal2 = 2; }
    stackVal1 = 3;
    boolClear = true;

    if (retVal === 0 || retVal === strMathError || retVal === strInf) {
      this.setState({
        inBox: [retVal],
      });
    } else if ((Math.abs(retVal) < 0.00000001 || Math.abs(retVal) > 100000000) && trig !== 1) {
    }
    else {
      if (retVal.toFixed(8) % 1 !== 0) {
        var i = 1;
        while (i < 10) {
          if ((retVal.toFixed(i) !== 0) && (retVal.toFixed(i) / retVal.toFixed(i + 8) === 1)) {
            retVal = retVal.toFixed(i);
            break;
          }
          else {
            i++;
          }
        }
      }
      else { retVal = retVal.toFixed(0); }
    }

    if (retVal === -0)
      retVal = 0;
    this.setState({
      inBox: [retVal],
      inBox1: [displayString]
    });
    trig = 0;
  }


  componentDidUpdate() {
    modeSelected = document.querySelector('input[name=degree_or_radian]:checked').value;
  }

  //radian or degree radio buttons -- update into radian or degree modes
  optionChange = e => {
    var value = e.target.getAttribute('value');
    this.setState({
      selectedOption: value,
    })
  }



  //Display trignometric values along with labels.
  displayTrignometric = (text, x) => {
    if (stackVal2 === 1) {
      var string = "";
      for (var i = openArray.length; i >= 0; i--) {
        string = string + displayString.substring(0, displayString.lastIndexOf("(") + 1);
        displayString = displayString.replace(string, "");
      }
      displayString = string.substring(0, string.lastIndexOf("("));
      trigDisplay = text + "(" + x + ")";
    }

    if (stackVal2 === 2 || stackVal1 === 3) {
      if (stackVal2 === 3) { trigDisplay = text + "(" + x + ")"; stackVal2 = 2; }
      else {
        displayString = displayString.replace(trigDisplay, "");
        trigDisplay = text + "(" + trigDisplay + ")";
      }
    }
    else { if (stackVal2 === 4) { displayString = ""; } trigDisplay = text + "(" + x + ")"; }
    displayString = displayString + trigDisplay;
  }

  mode

  inverseSineH = (inputVal) => {
    return Math.log(inputVal + Math.sqrt(inputVal * inputVal + 1));
  }

    //Display degree or radian along with labels(eg:Sind or Sinr)
  modeText = (text, x) => {
    var mode = "d";
    if (modeSelected !== "deg") { mode = "r"; }
    this.displayTrignometric(text + mode, x);
  }

  nthroot = (x, n) => {
    try {
      var negate = n % 2 === 1 && x < 0;
      if (negate)
        x = -x;
      var possible = Math.pow(x, 1 / n);
      n = Math.pow(possible, n);
      if (Math.abs(x - n) < 1 && ((x > 0) === (n > 0)))
        return (negate ? -possible : possible);
      else return (negate ? -possible : possible);
    } catch (e) { }
  }

  changeXBasedOnMode = (mode, inputValue) => {
    if (mode === "deg") {
      return (inputValue * (Math.PI / 180));
    }
    else if (mode === "rad") {
      return inputValue;
    }
  }

  tanCalc = (mode, inputValue) => {
    var ipVal = this.changeXBasedOnMode(mode, inputValue);
    if (ipVal % (Math.PI / 2) === "0") {
      if ((ipVal / (Math.PI / 2)) % 2 === "0") {
        return "0";
      } else {
        return strMathError;
      }
    } else {
      return Math.tan(ipVal);
    }
  }

  cosCalc = (mode, inputVal) => {
    var ipVal = this.changeXBasedOnMode(mode, inputVal);
    if (ipVal.toFixed(8) % (Math.PI / 2).toFixed(8) === "0") {
      if ((ipVal.toFixed(8) / (Math.PI / 2)).toFixed(8) % 2 === "0") {
        return Math.cos(ipVal);
      } else {
        return "0";
      }
    } else {
      return Math.cos(ipVal);
    }
  }

  sinCalc = (mode, inputVal) => {
    var ipVal = this.changeXBasedOnMode(mode, inputVal);
    if ((ipVal.toFixed(8) % Math.PI).toFixed(8) === 0) {
      return "0";
    } else {
      return Math.sin(ipVal);
    }

  }

  cotCalc = (mode, inputVal) => {
    var tanVal = this.tanCalc(mode, inputVal);
    if (tanVal === 0) {
      return strMathError;
    } else if (tanVal === strMathError) {
      return '0';
    } else {
      return 1 / tanVal;
    }

  }

  secCalc = (mode, inputVal) => {
    var cosVal = this.cosCalc(mode, inputVal);
    if (cosVal.toFixed(8) === 0) {
      return strMathError;
    } else {
      return 1 / cosVal;
    }
  }

  cosecCalc = (mode, inputVal) => {
    var sinVal = this.sinCalc(mode, inputVal);
    if (sinVal.toFixed(8) === 0) {
      return strMathError;
    } else {
      return 1 / sinVal;
    }
  }


  changeValOfInvBasedOnMode = (mode, ipVal) => {
    if (mode === 'deg') {
      return (180 / Math.PI) * ipVal;
    } else {
      return ipVal;
    }
  }

  sinInvCalc = (mode, inputVal) => {
    var opVal;
    var ipVal = Math.asin(inputVal);
    if (inputVal < -1 || inputVal > 1) {
      opVal = strMathError;
    } else {
      opVal = this.changeValOfInvBasedOnMode(mode, ipVal);
    }
    return opVal;
  }

  cosInvCalc = (mode, inputVal) => {
    var opVal;
    var ipVal = Math.acos(inputVal);
    if (inputVal < -1 || inputVal > 1) {
      opVal = strMathError;
    } else {
      opVal = this.changeValOfInvBasedOnMode(mode, ipVal);
    }
    return opVal;
  }

  tanInvCalc = (mode, inputVal) => {
    var opVal;
    var ipVal = Math.atan(inputVal);
    if (strNaN.indexOf(ipVal.toFixed(8)) > -1) {
      opVal = strMathError;
    } else {
      opVal = this.changeValOfInvBasedOnMode(mode, ipVal);
    }
    return opVal;
  }


  //Factorial Function
  factorial = (n) => {
    if (n > 170) return strInf;
    if (n === 1 || n === 0) return 1;
    else if (n < 0) return strMathError;
    else if (n % 1 !== 0) return this.gamma(n + 1);
    else
      return n * this.factorial(n - 1);

  }

  gamma = (n) => {
    var g = 7, // g represents the precision desired, p is the values of p[i] to plug into Lanczos' formula
      p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (n < 0.5) {
      return Math.PI / Math.sin(n * Math.PI) / this.gamma(1 - n);
    } else {
      n--;
      var x = p[0];
      for (var i = 1; i < g + 2; i++) {
        x += p[i] / (n + i);
      }
      var t = n + g + 0.5;
      return (Math.sqrt(2 * Math.PI) * Math.pow(t, (n + 0.5)) * Math.exp(-t) * x);
    }
  }






  //for c,back and equalto operations
  btnCommand = async (e) => {
    var value = e.target.getAttribute('value');
    var inBoxVal = this.state.inBox.join('');
    var inBox1Val = this.state.inBox1.join('');
    var strInput = inBoxVal;
    switch (value) {
      case "=": if (inBoxVal.indexOf("Infinity") > -1 || inBoxVal.indexOf(strMathError) > -1) return;
        while (opCode || opCodeArray[0]) {
          if (stackArray[stackArray.length - 1] === "{") {
            stackArray.pop();
          }
          await this.oscBinaryOperation();
          stackVal = stackArray[stackArray.length - 1];
          opCode = opCodeArray[opCodeArray.length - 1];
          stackArray.pop();
          opCodeArray.pop();
        };
        opCode = 0; 
         displayString = ""; trigDisplay = ""; stackVal = strEmpty; openArray = [];
        if (stackVal1 !== 2) {
          if (stackVal1 === 3 || stackVal2 === 1) {
            if (stackVal2 !== 3) strInput = "";
          }
          if (newOpCode === 9) {
            if (strInput.indexOf("-") > -1)
              
              this.setState({
                inBox1: [inBox1Val.substring(0, inBox1Val.lastIndexOf("+"))],
              });
            else {
              this.setState({
                inBox1: [inBox1Val.replace("e+0", "e+")],
              });
            }
          }	
          this.setState({
            inBox1: [inBox1Val + strInput],
          });
        }
        stackVal1 = 2;
        newOpCode = 0;
        stackVal2 = 0; stackArray = []; opCodeArray = [];
        return;


      case "back": if (stackVal1 === 1 || stackVal2 === 3) {
        if (strInput.length > 1) {
          if (inBoxVal.indexOf("Infinity") > -1 || inBoxVal.indexOf(strMathError) > -1) return;

          this.setState({
            inBox: [strInput.substring(0, strInput.length - 1)],
          });
          inBoxVal = this.state.inBox.join('');
          if (inBoxVal === "-")
            this.setState({
              inBox: ["0"],
            });
          break;
        }
        else {
          this.setState({
            inBox: ["0"],
          });
          break;
        }
      }
      else
        break;

      case "c":
        this.setState({
          inBox: [strEmpty],
        });
        displayString = "";
        trigDisplay = "";
        stackArray = []; opCodeArray = []; openArray = [];
        this.setState({
          inBox1: [""],
        });
        stackVal = strEmpty;
        stackVal1 = 1;
        stackVal2 = 0;
        newOpCode = 0;
        opCode = 0;
        break;
      default: break;
    }
  }

  helpDisplay = () => {
    this.setState({
      display: "none",
      displayText: "block",
    })
  }

  helpHide = () => {
    this.setState({
      display: "block",
      displayText: "none"
    })
  }

  minimize = () => {
    this.setState({
      minimize: "ui-widget-content calc_container reduceWidth",

      displayMain: 'none',
      header: 'reduceHeader',
      displayMax: 'block',
    })
  }

  maximize = () => {
    this.setState({
      minimize: "ui-widget-content calc_container",
      displayMain: "block",
      header: "",
      displayMax: "none",
    })
  }




  render() {
    return (
      <div id="keyPad" className={this.state.minimize}>
        <div id="helptopDiv">
          <span className={this.state.header}>Scientific Calculator</span>
          <div href="#nogo" id="keyPad_Help" className="help_back" style={{ display: this.state.displayMain }} onClick={this.helpDisplay}>Help</div>
          <div href="#nogo" id="keyPad_Helpback" className="help_back" style={{ display: this.state.displayText }} onClick={this.helpHide}>Back</div>
        </div>

        <div className="calc_min" id="calc_min" onClick={this.minimize} style={{ display: this.state.displayMain }}></div>
        <div className="calc_max" id="calc_max" onClick={this.maximize} style={{ display: this.state.displayMax }}> <i className="fa fa-window-maximize"></i></div>


        <div className="calc_close" id="closeButton"></div>


        <div className="mainContentArea" style={{ display: this.state.displayMain }}>
          <Display id="dis" data={this.state.inBox1} display={this.state.display} />
          <div className="text_container" style={{ display: this.state.display }}>

            <Display id="dis" data={this.state.inBox} />

            <span id="memory" className={this.state.mem}>
              <font size="2">M</font>
            </span>
          </div>
          <font size="2">
            <div className="clear"></div>
            <div className="left_sec" style={{ display: this.state.display }}>
              <div className="calc_row clear">
                <a href="#nogo" id="keyPad_btnMod" className="keyPad_btnBinaryOp" value="mod" onClick={this.btnBinary}>mod</a>

                <div className="degree_radian">
                  <input type="radio" name="degree_or_radian" value="deg" checked={this.state.selectedOption === "deg"} onChange={this.optionChange} />Deg
            <input type="radio" name="degree_or_radian" value="rad" checked={this.state.selectedOption === "rad"} onChange={this.optionChange} />Rad
          </div>
                <a href="#nogo" id="keyPad_btnPi" className="keyHidden">&#960;</a>
                <a href="#nogo" id="keyPad_btnE" className="keyHidden">e</a>
                <a href="#nogo" id="keyPad_btnE" className="keyHidden">e</a>
                <a href="#nogo" id="keyPad_MC" className="keyPad_btnMemoryOp" value="MC" onClick={this.btnMemory}>MC</a>
                <a href="#nogo" id="keyPad_MR" className="keyPad_btnMemoryOp" value="MR" onClick={this.btnMemory}>MR</a>
                <a href="#nogo" id="keyPad_MS" className="keyPad_btnMemoryOp" value="MS" onClick={this.btnMemory}>MS</a>
                <a href="#nogo" id="keyPad_M+" className="keyPad_btnMemoryOp" value="M+" onClick={this.btnMemory}>M+</a>
                <a href="#nogo" id="keyPad_M-" className="keyPad_btnMemoryOp" value="M-" onClick={this.btnMemory}>M-</a>
              </div>
              <div className="calc_row clear">
                <a href="#nogo" id="keyPad_btnSinH" className="keyPad_btnUnaryOp min" value="sinh" onClick={this.btnUnaryOp}>sinh</a>
                <a href="#nogo" id="keyPad_btnCosinH" className="keyPad_btnUnaryOp min" value="cosh" onClick={this.btnUnaryOp}>cosh</a>
                <a href="#nogo" id="keyPad_btnTgH" className="keyPad_btnUnaryOp min" value="tanh" onClick={this.btnUnaryOp} >tanh</a>
                <a href="#nogo" id="keyPad_EXP" className="keyPad_btnBinaryOp" value="EXP" onClick={this.btnBinary}>Exp</a>
                <a href="#nogo" id="keyPad_btnOpen" className="keyPad_btnBinaryOp" value="(" onClick={this.btnBinary}>(</a>
                <a href="#nogo" id="keyPad_btnClose" className="keyPad_btnBinaryOp " value=")" onClick={this.btnBinary}>)</a>
                <a href="#nogo" id="keyPad_btnBack" className="keyPad_btnCommand calc_arrows" value="back" onClick={this.btnCommand}>
                  &#8592;</a>
                <a href="#nogo" id="keyPad_btnAllClr" className="keyPad_btnCommand" value="c" onClick={this.btnCommand}>C</a>
                <a href="#nogo" id="keyPad_btnInverseSign" className="keyPad_btnUnaryOp" value="+/-" onClick={this.btnUnaryOp}>+/-</a>
                <a href="#nogo" id="keyPad_btnSquareRoot" className="keyPad_btnUnaryOp" value="sqrt" onClick={this.btnUnaryOp}>&#8730;</a>
              </div>
              <div className="calc_row clear">
                <a href="#nogo" id="keyPad_btnAsinH" className="keyPad_btnUnaryOp min" value="sinh-1" onClick={this.btnUnaryOp} >
                  sinh<span value="sinh-1" className='superscript'>-1</span>
                </a>
                <a href="#nogo" id="keyPad_btnAcosH" className="keyPad_btnUnaryOp min" value="cosh-1" onClick={this.btnUnaryOp}>
                  cosh<span value="cosh-1" className='superscript'>-1</span>
                </a>
                <a href="#nogo" id="keyPad_btnAtanH" className="keyPad_btnUnaryOp min" value="tanh-1" onClick={this.btnUnaryOp} >
                  tanh<span value="tanh-1" className='superscript'>-1</span>
                </a>
                <a href="#nogo" id="keyPad_btnLogBase2" className="keyPad_btnUnaryOp" value="logbase2" onClick={this.btnUnaryOp} >
                  log<span value="logbase2" className="subscript">2</span>x
            </a>
                <a href="#nogo" id="keyPad_btnLn" className="keyPad_btnUnaryOp" value="ln" onClick={this.btnUnaryOp}>ln</a>
                <a href="#nogo" id="keyPad_btnLg" className="keyPad_btnUnaryOp" value="log" onClick={this.btnUnaryOp}>log</a>
                <a href="#nogo" ref={this.myRef} className="keyPad_btnNumeric" onClick={this.buttonNumeric} value="7">7</a>
                <a href="#nogo" ref={this.myRef} className="keyPad_btnNumeric" onClick={this.buttonNumeric} value="8">8</a>
                <a href="#nogo" ref={this.myRef} className="keyPad_btnNumeric" onClick={this.buttonNumeric} value="9">9</a>
                <a href="#nogo" id="keyPad_btnDiv" className="keyPad_btnBinaryOp" value="/" onClick={this.btnBinary}>/</a>
                <a href="#nogo" id="keyPad_%" className="keyPad_btnBinaryOp" value="%" onClick={this.btnBinary}>%</a>
              </div>
              <div className="calc_row clear">
                <a href="#nogo" id="keyPad_btnPi" className="keyPad_btnConst" onClick={this.buttonConst} value="p">&#960;</a>
                <a href="#nogo" id="keyPad_btnE" className="keyPad_btnConst" onClick={this.buttonConst} value="keyPad_btnE">e</a>
                <a href="#nogo" id="keyPad_btnFact" className="keyPad_btnUnaryOp" value="fact" onClick={this.btnUnaryOp}>n!</a>
                <a href="#nogo" id="keyPad_btnYlogX" className="keyPad_btnBinaryOp" value="YlogX" onClick={this.btnBinary} >

                  log<span value="logbase2" className="subscript">y</span>x
          </a>
                <a href="#nogo" id="keyPad_EXP" className="keyPad_btnBinaryOp" value="exp" onClick={this.btnUnaryOp}>
                  e<span value="exp" className="superscript">x</span>
                </a>
                <a href="#nogo" id="keyPad_btn10X" className="keyPad_btnUnaryOp" value="10^x" onClick={this.btnUnaryOp}>

                  10<span value="10^x" className="superscript">x</span>
                </a>
                <a href="#nogo" ref={this.myRef} className="keyPad_btnNumeric" onClick={this.buttonNumeric} value="4">4</a>
                <a href="#nogo" ref={this.myRef} className="keyPad_btnNumeric" onClick={this.buttonNumeric} value="5">5</a>
                <a href="#nogo" ref={this.myRef} className="keyPad_btnNumeric" onClick={this.buttonNumeric} value="6">6</a>
                <a href="#nogo" id="keyPad_btnMult" className="keyPad_btnBinaryOp" value="*" onClick={this.btnBinary}>*</a>
                <a href="#nogo" id="keyPad_btnInverse" className="keyPad_btnUnaryOp" value="1/x" onClick={this.btnUnaryOp}>1/x</a>
              </div>
              <div className="calc_row clear">
                <a href="#nogo" id="keyPad_btnSin" className="keyPad_btnUnaryOp min" value="sin" onClick={this.btnUnaryOp}>sin</a>
                <a href="#nogo" id="keyPad_btnCosin" className="keyPad_btnUnaryOp min" value="cos" onClick={this.btnUnaryOp}>cos</a>

                <a href="#nogo" id="keyPad_btnTg" className="keyPad_btnUnaryOp min" value="tan" onClick={this.btnUnaryOp}>tan</a>
                <a href="#nogo" id="keyPad_btnYpowX" className="keyPad_btnBinaryOp" value="XpowY" onClick={this.btnBinary}>
                  x<span value="XpowY" className="superscript">y</span>
                </a>
                <a href="#nogo" id="keyPad_btnCube" className="keyPad_btnUnaryOp" value="xCube" onClick={this.btnUnaryOp}>
                  x<span value="xCube" className="superscript">3</span>
                </a>
                <a href="#nogo" id="keyPad_btnSquare" className="keyPad_btnUnaryOp" value="x^2" onClick={this.btnUnaryOp} >

                  x<span value="x^2" className="superscript">2</span>
                </a>
                <a href="#nogo" ref={this.myRef} className="keyPad_btnNumeric" onClick={this.buttonNumeric} value="1">1</a>
                <a href="#nogo" ref={this.myRef} className="keyPad_btnNumeric" onClick={this.buttonNumeric} value="2">2</a>
                <a href="#nogo" ref={this.myRef} className="keyPad_btnNumeric" onClick={this.buttonNumeric} value="3">3</a>
                <a href="#nogo" id="keyPad_btnMinus" className="keyPad_btnBinaryOp" value="-" onClick={this.btnBinary}>-</a>
              </div>
              <div className="calc_row clear">
                <a href="#nogo" id="keyPad_btnAsin" className="keyPad_btnUnaryOp min" value="sin-1" onClick={this.btnUnaryOp}>
                  sin<span value="sin-1" className="superscript">-1</span>
                </a>
                <a href="#nogo" id="keyPad_btnAcos" className="keyPad_btnUnaryOp min" value="cos-1" onClick={this.btnUnaryOp}>
                  cos<span value="cos-1" className="superscript">-1</span>
                </a>
                <a href="#nogo" id="keyPad_btnAtan" className="keyPad_btnUnaryOp min" value="tan-1" onClick={this.btnUnaryOp}>
                  tan<span value="tan-1" className="superscript">-1</span>
                </a>
                <a href="#nogo" id="keyPad_btnYrootX" className="keyPad_btnBinaryOp" value="YrootX" onClick={this.btnBinary}>
                  <span value="YrootX" className="superscript" style={{ top: '-8px' }}>y</span>
                  <span value="YrootX" style={{ fontSize: '1.2em', margin: '-6px 0 0 -9px' }}>&#8730;x</span>
                </a>
                <a href="#nogo" id="keyPad_btnCubeRoot" className="keyPad_btnUnaryOp" value="cbrt" onClick={this.btnUnaryOp}>&#8731; </a>
                <a href="#nogo" id="keyPad_btnAbs" className="keyPad_btnUnaryOp" value="abs" onClick={this.btnUnaryOp} >|x|</a>
                <a href="#nogo" id="keyPad_btn0" className="keyPad_btnNumeric" onClick={this.buttonNumeric} value="0">0</a>
                <a href="#nogo" id="keyPad_btnDot" className="keyPad_btnNumeric" onClick={this.buttonNumeric} value=".">.</a>
                <a href="#nogo" id="keyPad_btnPlus" className="keyPad_btnBinaryOp" value="+" onClick={this.btnBinary}>+</a>
                <a href="#nogo" id="keyPad_btnEnter" className="keyPad_btnCommand " value="=" onClick={this.btnCommand}>=</a>
              </div>

            </div>
            <div className="clear"></div>
            {/* help COntent */}

            <div id="helpContent" style={{ display: this.state.displayText }}>
              <h3 style={{ textAlign: 'center' }}><strong>Calculator Instructions</strong></h3>
              Allows you to perform basic and complex mathematical operations such as modulus, square root, cube root, trigonometric, exponential, logarithmic, hyperbolic functions, etc.
		  <br /> You can operate the calculator using the buttons provided on screen with your mouse. <br />
              <br />
              <h3 style={{ textDecoration: 'underline', color: 'green' }} >Do's:</h3>
              <ul>
                <li> Be sure to press [C] when beginning a new calculation.</li>
                <li> Simply an equation using parenthesis and other mathematical operators.</li>
                <li> Use the predefined operations such as p (Pi), log, Exp to save time during calculation.</li>
                <li> Use memory function for calculating cumulative totals.</li>
                <strong>
                  [M+]: Will add displayed value to memory.
		<br />
                  [MR]: Will recall the value stored in memory.
		<br />
                  [M-]: Subtracts the displayed value from memory.
		</strong>
                <li> Be sure select the angle unit (Deg or Rad) before beginning any calculation.</li>
                <strong>Note: By default angle unit is set as Degree</strong>
              </ul>
              <h3><span style={{ textDecoration: 'underline', color: 'red' }}>Dont's:</span></h3>
              <ul>
                <li> Perform multiple operations together.</li>
                <li> Leave parenthesis unbalanced.</li>
                <li> Change the angle unit (Deg or Rad) while performing a calculation..</li>
              </ul>
              <h3><span style={{ textDecoration: 'underline' }}>Limitations:</span></h3>
              <ul>
                <li> Keyboard operation is disabled.</li>
                <li> The output for a Factorial calculation is precise up to 14 digits.</li>
                <li> The output for Logarithmic and Hyperbolic calculations is precise up to 5 digits.</li>
                <li> Modulus (mod) operation performed on decimal numbers with 15 digits would not be precise.</li>
                <br />
                <strong> Use mod operation only if the number comprises of less than 15 digits i.e. mod operation provides best results for smaller numbers.</strong>
                <br />
                <li>The range of value supported by the calculator is 10(-323) to 10(308).</li>
              </ul>
              <br />
              <br />
            </div>

            {/* help Content end */}

          </font>
        </div>
      </div>
    );
  }

}

export default App;