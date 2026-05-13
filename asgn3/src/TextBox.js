function TextBox(x, y) {
    this.x = x;
    this.y = y;
    this.maxWidth = 550;
    
    this.speed = 0.02;
    this.textTimer = this.speed;
    this.textToLoad = "Placeholder";
    this.textNo = 0;
    this.line = 1;
    
    this.textLoaded1 = '';
    this.textLoaded2 = '';
    this.textLoaded3 = '';
    this.charPointer = '';
    this.currentWord = '';
    this.textNoAtWord = 0;
    
    this.pause = false;
    this.isSkipping = false;
    this.wait = 0;
    
    this.isVisible = false;
    this.finished = true;
    this.punctuation = ['.',',','!','?'];
    this.commands = ['!','_','/','~','<','>'];
    
    this.who = "T";//unique code only for this project
}

TextBox.prototype.draw = function () {
    if(this.isVisible) {
        switch(this.who) {
            case "S":
                ctx.fillStyle = "#622ecd";
                break;
            case "D":
                ctx.fillStyle = "#4127b2";
                break;
            default:
                ctx.fillStyle = "#100062";
                break;
        }
        ctx.fillRect(this.x - 38, this.y - 43, 616, 141);
        switch(this.who) {
            case "S":
                ctx.fillStyle = "#ff9ff2";
                break;
            case "D":
                ctx.fillStyle = "#ff9ff2";
                break;
            default:
                ctx.fillStyle = "white";
                break;
        }
        ctx.fillRect(this.x - 35, this.y - 40, 610, 135);
        switch(this.who) {
            case "S":
                ctx.fillStyle = "#ff657f";
                break;
            case "D":
                ctx.fillStyle = "#4127b2";
                break;
            default:
                ctx.fillStyle = "#100062";
                break;
        }
        ctx.fillRect(this.x - 30, this.y - 35, 600, 125);

        var commandChain = this.drawCommand(this.textLoaded1, this.x, this.y, "None", this.textNo);
        commandChain = this.drawCommand(this.textLoaded2, this.x, this.y + 40, commandChain, this.textNo-this.textLoaded1.length-1);
        this.drawCommand(this.textLoaded3, this.x, this.y + 80, commandChain, this.textNo-this.textLoaded1.length-this.textLoaded2.length);
        if (this.finished) {
            ctx.fillStyle = "#e5ce50";
            triangle2D(this.x + 520, this.y + 70 + wiggle(0,1,4), this.x + 530, this.y + 80  + wiggle(0,1,4), this.x + 540, this.y + 70  + wiggle(0,1,4));
        }
    }
}
function triangle2D(side1X, side1Y, side2X, side2Y, side3X, side3Y) {
    ctx.beginPath();
    ctx.moveTo(side1X, side1Y);
    ctx.lineTo(side2X, side2Y);
    ctx.lineTo(side3X, side3Y);
    ctx.fill();
}
// wiggles a variable
function wiggle(offset, speed, mult) {
    var x = Math.sin(offset+(Math.PI * speed * 1* g_lastSeconds));
    return Math.round(x * mult);
}

TextBox.prototype.loadIn = function (delta) {
    if(this.finished) {
        return;
    }
    if (this.pause && !this.isSkipping) {
        this.wait -= delta;
        if (this.wait < 0) {
            this.pause = false;
        }
        return;
    }
    
    var periodCheck;
    this.textTimer -= delta;
    
    while(this.textTimer < 0) {
        if(!this.isSkipping) {
            this.textTimer += this.speed;
        }
        if (this.textNo === this.textToLoad.length) {
            this.finished = true;
            break;
        }
        
        // Pause when on punctuation but not when skipping
        periodCheck = this.textToLoad.substring(this.textNo, this.textNo + 1);
        if (!this.isSkipping) {  
            switch(periodCheck) {
                case '.':
                case '!':
                case '?':                           //long break
                    this.pause = true;
                    this.wait = this.speed*10;
                    break;
                case ',':                           // small break
                    this.pause = true;
                    this.wait = this.speed*5;
                    break;
                case '/':
                case '~':
                case '<':
                case '>':
                    this.textTimer -= this.speed;   // the text doesn't get hung up on draw commands
                    break;
                default:
                    break;
            }
        }
        
        /*if(!this.isSkipping) {
            switch(this.who) {
                case "S":
                    audioController.playSound("Sno");
                    break;
                case "T":
                    audioController.playSound("T");
                    break;
                case "D":
                    audioController.playSound("Dot");
                    break;
                default:
                    break;
            }
        } //unique code only for this project*/
        
        this.currentWord += this.textToLoad.substring(this.textNo, this.textNo + 1);
        switch(this.line) {
            case 1:
                if (!this.fits(this.textLoaded1)) {
                    this.textLoaded1 = this.textLoaded1.substring(0, this.textNoAtWord);
                    this.textLoaded2 += this.currentWord;
                    this.line = 2;
                    break;
                }
                this.textLoaded1 += this.textToLoad.substring(this.textNo, this.textNo + 1);
                break;
            case 2:
                if (!this.fits(this.textLoaded2)) {
                    this.line = 3;
                    this.textLoaded2 = this.textLoaded2.substring(0, this.textNoAtWord-this.textLoaded1.length);
                    this.textLoaded3 += this.currentWord;
                    break;
                }
                this.textLoaded2 += this.textToLoad.substring(this.textNo, this.textNo + 1);
                break;
            case 3:
                if (!this.fits(this.textLoaded3)) {
                    this.finished = true;
                    break;
                }
                this.textLoaded3 += this.textToLoad.substring(this.textNo, this.textNo + 1);
                break;
            default:
                this.finished = true;
                break;
        }
        if(periodCheck.indexOf(' ') !== -1) { // extend word to next sentance
            this.currentWord = '';
            this.textNoAtWord = this.textNo;
        }
        this.textNo++;
        if (this.textNo === this.textToLoad.length) {
            //SnowCone.updateSprite(SnowCone.currentEmotion, false); //Unique Code only for this project
            //Dotty.updateSprite(Dotty.currentEmotion, false); //Unique Code only for this project
            this.finished = true;
            break;
        }
    }
}

TextBox.prototype.fits = function (currentText) {
    return ctx.measureText(currentText).width < this.maxWidth;
}

TextBox.prototype.skip = function () {
    if (!this.finished) {
        this.isSkipping = true;
    }
}
TextBox.prototype.nextText = function (text, who) {
    this.textTimer = this.speed;
    this.textToLoad = text;
    this.textNo = 0;
    this.line = 1;
    
    this.textLoaded1 = '';
    this.textLoaded2 = '';
    this.textLoaded3 = '';
    this.charPointer = '';
    this.currentWord = '';
    this.textNoAtWord = 0;
    
    this.isSkipping = false;
    this.wait = 0;
    
    this.isVisible = true;
    this.finished = false;
    
    this.who = who;//unique code only for this project
}
TextBox.prototype.printLog = function (text) {
    console.log("Loaded text: " + this.textLoaded1 + " " + this.textLoaded2 + " " + this.textLoaded3 +
               "\nCurrentText: " + this.textToLoad +
               "\nfinished = " + this.finished);
}
TextBox.prototype.setVisible = function (newVis) {
    this.isVisible = newVis;
}
TextBox.prototype.drawCommand = function (tempText, x, y, editStart, nearEnd) {
    var xOffset = 0;
    var periodCheck;
    var currentEdit = editStart;
    var ignoreCommand = false;
    for(var i = 0; i < tempText.length; i++) {
        periodCheck = tempText.substring(i, i + 1);
        if(!ignoreCommand) {
            switch(periodCheck) {
                case '/':                   // allows literals /~ will print ~
                    ignoreCommand = true; 
                    continue;
                case '~':                   // wiggle command toggle. ~hi~ will make hi wiggly
                    if(editStart === "Wiggle") {
                        editStart = "None";
                        continue;
                    }
                    editStart = "Wiggle"; 
                    continue;
                case '_':                   // creep command toggle. _hi_ will make hi creep slowly
                    if(editStart === "Creep") {
                        editStart = "None";
                        continue;
                    }
                    editStart = "Creep"; 
                    continue;
                case '&':                   // Chatter command toggle. &hi& will make hi chatter quickly
                    if(editStart === "Chatter") {
                        editStart = "None";
                        continue;
                    }
                    editStart = "Chatter"; 
                    continue;
                case '<':                   // Important Proper Noun. Gets a special color based on what it is.
                    editStart = "Important"; 
                    continue;
                case '>':                   // Important Proper Noun end. 
                    editStart = "None"; 
                    continue;
                default:
                    break;
            }
        }
        ignoreCommand = false;
        ctx.font = "30px jackeyfont";
        ctx.fillStyle = "white";
        if((nearEnd - i) === 1 && !this.finished && !this.pause && !this.punctuation.includes(periodCheck)) {
            ctx.font = "60px jackeyfont";
        }
        switch(editStart) {
            case "Chatter":
                ctx.fillText(tempText.charAt(i), x + xOffset, y + wiggle(i*(Math.PI/0.8), 16, 1));
                break;
            case "Creep":
                ctx.fillText(tempText.charAt(i), x + xOffset, y + wiggle(Math.pow(i,1.5), 0.2, 1));
                break;
            case "Wiggle":
                ctx.fillText(tempText.charAt(i), x + xOffset, y + wiggle(i*(Math.PI/8), 2, 4));
                break;
            case "Important":
                switch(this.who) {
                    case "S":
                        ctx.fillStyle = "#4127b2";
                        break;
                    case "D":
                        ctx.fillStyle = "#ff657f";
                        break;
                    default:
                        ctx.fillStyle = "#ff657f";
                        break;
                }
                ctx.fillText(tempText.charAt(i), x + xOffset, y);
                break;
            case "None":
            default:
                ctx.fillText(tempText.charAt(i), x + xOffset, y);
                break;
        } 
        ctx.font = "30px jackeyfont";       
        xOffset += ctx.measureText(tempText.charAt(i)).width;
    }
    return editStart;
}
