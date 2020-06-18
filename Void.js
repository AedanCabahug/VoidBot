// ==UserScript==
// @name         Void Console
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @author       ⌈⌘⌋
// @match        https://www.multiplayerpiano.com/*
// @grant        none
// ==/UserScript==

var UITheme = {};
UITheme.Font = "Roboto, Calibri, Arial, sans-serif";
UITheme.FontColor = "#009688";
UITheme.FontWeight = "100";
UITheme.Dark = "#141E24";
UITheme.Light = "#21313B";
UITheme.Lighter = "#364C59";
UITheme.RotateA = "009688";
UITheme.RotateB = "006296";
UITheme.ButtonColor = "rgba(0, 255, 255, 0.1)";
UITheme.ButtonTextColor = "#009688";
UITheme.MPPForceTheme = false;
UITheme.MPPBackground = null;
UITheme.MPPBottom = null;

function hex(n) {
    if (n.toString(16).length < 2) return '0' + n;
    return n.toString(16);
}

class UIButton {

    constructor (Text, Click, TargetElement, Width, Height) {
        var Self = this;
        this.Highlighted = false;
        this.Button = new Part("button", "", TargetElement).SetProperties({
            backgroundColor: UITheme.ButtonColor,
            border: "none",
            borderRadius: "3px",
            color: UITheme.ButtonTextColor,
            width: Width + "px" || "100px",
            height: Height + "px" || "25px",
            outline: "none"
        }).SetContent(Text).RegisterHandler("onclick", Click).RegisterAnimation(function () {
            if (Self.Button.HasFocus() || Self.Highlighted) {
                Self.Button.SetProperty("border", "1px solid " + AnimatedColor(0));
            } else Self.Button.SetProperty("border", "none");
        });
    }
    
}

function AnimatedLoop(Loop, Finish, Delay, Amount) {
    var Iterations = 0;

    function Call() {
        Loop(++Iterations);

        if (Iterations < Amount) {
            setTimeout(Call, Delay);
        } else Finish();
    }

    Call();
}

var Timer = 0;
var Negate = false;
function AnimatedColor(Offset) {
    var r = Math.ceil(parseInt(UITheme.RotateA.substring(0, 2), 16) * ((Timer + Offset) / 360) + parseInt(UITheme.RotateB.substring(0, 2), 16) * (1 - ((Timer + Offset) / 360)));
    var g = Math.ceil(parseInt(UITheme.RotateA.substring(2, 4), 16) * ((Timer + Offset) / 360) + parseInt(UITheme.RotateB.substring(2, 4), 16) * (1 - ((Timer + Offset) / 360)));
    var b = Math.ceil(parseInt(UITheme.RotateA.substring(4, 6), 16) * ((Timer + Offset) / 360) + parseInt(UITheme.RotateB.substring(4, 6), 16) * (1 - ((Timer + Offset) / 360)));

    return '#' + hex(r) + hex(g) + hex(b);
}

setInterval(function () {
    if (Negate) {
        Timer --;
    } else Timer ++;
    if (Timer >= 360)
        Negate = true;
    else if (Timer <= 0)
        Negate = false;
});

class DetachableModule {

    constructor(ModuleName) {
        this.Name = ModuleName;
        this.Parent = null;
        this.ClassName = "DetachableModule";
        this.Disabled = true;
        this.DisposableMemory = null;
        this.SolidMemory = null;
        this.LocalMemory = null;
        this.Routines = [];
        this.LoadFunctions = [];
    }

    Destroy(Debris) {
        Debris.push({
            Source: this.Name,
            Data: this.SolidMemory
        });

        for (var v in this.LocalMemory) delete this[v];
        for (var i = 0; i < this.Routines.length; i++) clearInterval(this.Routines[i]);

        this.SolidMemory = null
        this.DisposableMemory = null;
        this.LocalMemory = null;
        this.Disabled = true;
        this.Parent = null;
        this.Routines = [];
    }

    CreateRoutine(Routine, Delay) {
        if (this.Disabled) return;
        var Self = this;

        var ID = setInterval(function () {
            if (Self.Disabled) return;

            Routine(Self);
        }, Delay);

        this.Routines.push(ID);
        return ID;
    }

    ClearRoutines() {
        for (var i = 0; i < this.Routines.length; i++) {
            clearInterval(this.Routines[i]);
        }

        this.Routines = [];
    }

    LoadComplete() {
        for (var i = 0; i < this.LoadFunctions.length; i++) {
            this.LoadFunctions[i]();
        }
    }

    Instantiate(Finish) {
        if (!this.Disabled) return;

        this.DisposableMemory = Object.create(null);
        this.SolidMemory = Object.create(null);
        this.LocalMemory = Object.create(null);
        this.Disabled = false;

        this.InstantiationFunction = Finish;

        this.CreateRoutine(function (Self) {
            for (var v in Self.LocalMemory) {
                Self[v] = Self.LocalMemory[v];
            }
        });

        Finish.call(this, this.DisposableMemory, this.SolidMemory, this.LocalMemory);
        return this;
    }

    Restart(WM) {
        if (this.Disabled) return;

        if (WM) {
            for (var v in this.LocalMemory) delete this[v];
            for (var i = 0; i < this.Routines.length; i++) clearInterval(this.Routines[i]);

            this.SolidMemory = null
            this.DisposableMemory = null;
            this.LocalMemory = null;
        }

        for (var i = 0; i < this.Routines.length; i++) clearInterval(this.Routines[i]);

        this.Disabled = true;
        this.Instantiate(this.InstantiationFunction);
    }

}

class Part {

    constructor(ElementName, ClassName, Parent) {
        this.Element = document.createElement(ElementName);
        this.Element.className = ClassName || "";
        this.ClassName = ClassName || "";
        this.Parent = Parent;
        this.Animations = [];

        if (Parent == null || !(Parent instanceof HTMLElement))
            this.Parent = document.body;

        if (Parent instanceof Part)
            this.Parent = Parent.Element;

        this.Parent.appendChild(this.Element);

        this.SetProperties(Part.InheritedProperties);
        
        var Timer = 0;
        var Self = this;
        setInterval(function () {
            for (var i = 0; i < Self.Animations.length; i++) {
                Self.Animations[i](Timer);
            }

            Timer ++;
        });
    }

    SetProperty(Property, Value) {
        this.Element.style[Property] = Value;
        return this;
    }

    SetProperties(Object) {
        for (var v in Object) {
            this.Element.style[v] = Object[v];
        }

        return this;
    }

    SetAttribute(Attribute, Value) {
        this.Element[Attribute] = Value;
        return this;
    }

    SetAttributes(Object) {
        for (var v in Object) {
            this.Element[v] = Object[v];
        }

        return this;
    }

    GetProperty(Property) {
        return this.Element.style[Property];
    }

    GetAttribute(Attribute) {
        return this.Element[Attribute];
    }

    SetContent(Content) {
        this.Element.innerHTML = Content;
        return this;
    }

    SetParent(NewParent) {
        NewParent.appendChild(this.Element);
        this.Parent = NewParent;
        return this;
    }

    SplitContents(ElementType) {
        var Arr = this.Element.innerHTML.split("");
        var SplitArr = [];

        this.Element.innerHTML = "";
        for (var i = 0; i < Arr.length; i++) {
            this.Element.appendChild(new Part(ElementType).SetContent(Arr[i]).Element);
        }

        return this;
    }

    RegisterHandler(HandleName, Handler) {
        this.Element[HandleName] = Handler;
        return this;
    }

    RegisterAnimation(Animation) {
        this.Animations.push(Animation);
        return this;
    }
    
    GetChildren() {
        return this.Element.children;
    }

    HasFocus() {
        return document.activeElement === this.Element;
    }

    ClearChildren() {
        this.Element.innerHTML = "";
        return this;
    }

}

Part.InheritedProperties = {
    fontFamily: UITheme.Font,
    fontWeight: UITheme.FontWeight,
    position: "absolute",
    outline: "none"
};

window.onload = function () {
    if (localStorage.getItem("UITheme")) {
        UITheme = JSON.parse(localStorage.getItem("UITheme"));
    }

    setInterval(function () {
        if (UITheme.MPPForceTheme) {
            document.body.style.backgroundSize = "cover";
            if (UITheme.MPPBackground.indexOf("#") >= 0)
                document.body.style.background = UITheme.MPPBackground;
            else document.body.style.backgroundImage = "url(" + UITheme.MPPBackground + ")";
    
            if (UITheme.MPPBottom.indexOf("#") >= 0)
                document.querySelector("#bottom").style.backgroundColor = UITheme.MPPBottom;
            else document.querySelector("#bottom").style.backgroundImage = "url(" + UITheme.MPPBottom + ")";
        }
    
        localStorage.setItem("UITheme", JSON.stringify(UITheme));
    });

    InitializeVoid();
};  

function InitializeVoid() {
    var BotDeveloper = "⌈⌘⌋";
    var BotVersion = "1.0.0";
    var BotName = "Void";

    // Void Console GUI 
    var ConsoleButton = new Part("div", "ugly-button", document.querySelector("#bottom .relative")).SetProperties({
        fontFamily: "verdana, \"DejaVu Sans\", sans-serif",
        left: "660px",
        top: "32px",
    }).SetContent(BotName + " Console").RegisterHandler("onclick", function (Event) {
        Event.stopPropagation();

        if (ConsoleUI.GetProperty("display") != "none") {
            AnimatedLoop(function (i) {
                ConsoleUI.SetProperty("opacity", ((100 - i) / 100));
            }, function () {
                ConsoleUI.SetProperty("display", "none");
            }, 5, 100);

            return;
        }

        ConsoleUI.SetProperty("display", "block");

        AnimatedLoop(function (i) {
            ConsoleUI.SetProperty("opacity", (i / 100));
        }, function () {}, 5, 100);
    });

    document.addEventListener("click", function (Event) {
        if (ConsoleUI.GetProperty("display") == "none") return;
        var Target = Event.target;

        do {
            if (Target == ConsoleUI.Element) return;
            Target = Target.parentNode;
        } while (Target);

        AnimatedLoop(function (i) {
            ConsoleUI.SetProperty("opacity", ((100 - i) / 100));
        }, function () {
            ConsoleUI.SetProperty("display", "none");
        }, 5, 100);
    });

    var ConsoleUI = new Part("div", "console").SetProperties({
        width: "650px",
        height: "500px",
        backgroundColor: UITheme.Light,
        zIndex: "998",
        color: "#FFFFFF",
        display: "none",
        padding: "10px"
    });

    var BoundingRect = ConsoleButton.Element.getBoundingClientRect();
    var x = BoundingRect.left + document.body.scrollLeft - 325;
    var y = BoundingRect.top + document.body.scrollTop - 520;

    ConsoleUI.SetProperties({
        left: x + "px",
        top: y + "px"
    });

    var Dragging = false;
    var NavigationBar = new Part("div", "navbar", ConsoleUI).SetProperties({
        width: "670px",
        height: "50px",
        backgroundColor: UITheme.Dark,
        position: "relative",
        left: "-10px",
        top: "-10px"
    }).RegisterHandler("onmousedown", function (Event) {
        var OffsetX = Event.clientX;
        var OffsetY = Event.clientY;
        Dragging = true;

        document.onmouseup = function () {
            Dragging = false;
        };

        document.onmousemove = function (Event2) {
            if (!Dragging) return;
            ConsoleUI.SetProperty("left", (ConsoleUI.GetAttribute("offsetLeft") - (OffsetX - Event2.clientX)) + "px");
            ConsoleUI.SetProperty("top", (ConsoleUI.GetAttribute("offsetTop") - (OffsetY - Event2.clientY)) + "px");
            OffsetX = Event2.clientX;
            OffsetY = Event2.clientY;
        };
    });

    var Heading = new Part("h2", "", NavigationBar).SetProperties({
        left: "7px"
    }).SetContent(BotName + " " + BotVersion).SplitContents("span").RegisterAnimation(function () {
        for (var i = 0; i < Heading.GetChildren().length; i++) {
            Heading.GetChildren()[i].style.position = "relative";
            Heading.GetChildren()[i].style.color = AnimatedColor(i * 9);
        }
    });

    var Caption = new Part("p", "", ConsoleUI).SetProperties({
        left: "7px",
        bottom: "5px",
        fontSize: "16px"
    }).SetContent("Coded by Aedan Cabahug").RegisterAnimation(function () {
        Caption.SetProperty("color", AnimatedColor(0));
    });

    var Sidebar = new Part("div", "sidebar", ConsoleUI).SetProperties({
        width: "150px",
        height: "400px",
        borderRight: "1px solid #" + UITheme.Dark,
        marginRight: "10px"
    });
    var SideBarItems = [];
    var SideBarFocus = -1;

    SideBarItems.push(new UIButton("Home", function () {
        if (SideBarFocus == 0) return;
        SideBarFocus = 0;
        ConsoleBody.ClearChildren();
    }, Sidebar, 150, 25)); new Part("br", "", Sidebar);

    SideBarItems.push(new UIButton("Script Executor", function () {
        if (SideBarFocus == 1) return;
        SideBarFocus = 1;
        ConsoleBody.ClearChildren();

        var ScriptInput = new Part("textarea", "scriptInput", ConsoleBody).SetProperties({
            width: "350px",
            height: "350px",
            left: "50%",
            transform: "translateX(-50%)",
            outline: "none",
            backgroundColor: UITheme.ButtonColor,
            color: UITheme.ButtonTextColor,
            border: "none",
            resize: "none"
        }).SetAttribute("spellcheck", false).RegisterAnimation(function () {
            ScriptInput.SetProperty("color", AnimatedColor(0));
        }); new Part("br", "", Sidebar);

        var ExecuteButton = new UIButton("Execute", function () {
            var Output = "undefined";
            var Error = false;

            try {
                Output = "Output: " + JSON.stringify(eval(ScriptInput.Element.value));
            } catch (e) {
                Output = e.toString();
                Error = true;
            }

            ScriptOutput.SetContent(Output);
        }, ConsoleBody, 350, 25);

        ExecuteButton.Button.SetProperties({
            left: "50%",
            transform: "translateX(-50%)",
            top: "360px"
        });

        var ScriptOutput = new Part("span", "", ConsoleBody).SetProperties({
            width: "350px",
            left: "50%",
            transform: "translateX(-50%)",
            top: "393px",
            fontSize: "16px"
        }).RegisterAnimation(function () {
            ScriptOutput.SetProperty("color", AnimatedColor(0));
        });
    }, Sidebar, 150, 25)); new Part("br", "", Sidebar);

    var RegisteredChannels = [];
    SideBarItems.push(new UIButton("Channels", function () {
        if (SideBarFocus == 2) return;
        SideBarFocus = 2;
        ConsoleBody.ClearChildren();

        function Update() {
            ConsoleBody.ClearChildren();

            for (var i = 0; i < RegisteredChannels.length; i++) {
                var Button = new UIButton(RegisteredChannels[i], function (Event) {
                    MPP.client.sendArray([{ m: "ch", _id: Event.srcElement.innerHTML }]);
                }, ConsoleBody, 350, 25);
                
                Button.Button.SetProperties({
                    left: "50%",
                    transform: "translateX(-50%)"
                });

                if (RegisteredChannels[i] == MPP.client.channel._id)
                    Button.Highlighted = true;
                else Button.Highlighted = false;

                new Part("br", "", ConsoleBody);
            }
        }

        Update();

        var NewList = [];
        MPP.client.on("ls", function(List) {
            if (SideBarFocus != 2 || List.c == false) return;
            for (var v in List.u) {
                var Channel = List.u[v];
                NewList.push(Channel._id);

                if (RegisteredChannels.indexOf(Channel._id) != -1)
                    continue;
                
                RegisteredChannels.push(Channel._id);

                new Part("br", "", ConsoleBody);
            }
            
            for (var i = 0; i < RegisteredChannels.length; i++) {
                if (NewList.indexOf(RegisteredChannels[i]) == -1) {
                    RegisteredChannels.splice(i, 1);
                }
            }

            Update();
        });

        MPP.client.on("ch", function () {
            if (SideBarFocus == 2) {
                Update();
            }
        })
        
        MPP.client.sendArray([{ m: "+ls" }]);
    }, Sidebar, 150, 25)); new Part("br", "", Sidebar);

    SideBarItems.push(new UIButton("Players", function () {
        if (SideBarFocus == 3) return;
        SideBarFocus = 3;
        ConsoleBody.ClearChildren();

        function Update() {
            ConsoleBody.ClearChildren();

            for (var v in MPP.client.ppl) {
                var Player = MPP.client.ppl[v];
                var Owner = Player._id == MPP.client.getOwnParticipant()._id;

                var Cell = new Part("div", Player._id + (Owner ? " highlight" : ""), ConsoleBody).SetProperties({
                    backgroundColor: UITheme.ButtonColor,
                    borderRadius: "3px",
                    width: "480px",
                    height: "25px",
                    paddingLeft: "5px",
                    color: UITheme.FontColor
                }).RegisterHandler("onclick", function (Event) {
                    for (var v in MPP.client.ppl) {
                        if (MPP.client.ppl[v]._id == Event.srcElement.className.split(" ")[0]) {
                            prompt("ID of " + MPP.client.ppl[v].name, Event.srcElement.className.split(" ")[0]);
                        }
                    }
                });
        
                var Name = new Part("span", Player._id, Cell).SetContent(Player.name + " #" + Player._id).SetProperty("fontSize", "16px");
        
                new Part("br", "", ConsoleBody);
            }
        }

        Update();

        MPP.client.on("ch", function () {
            if (SideBarFocus == 3) {
                Update();
            }
        })
    }, Sidebar, 150, 25)); new Part("br", "", Sidebar);

    SideBarItems.push(new UIButton("MPP Theme", function () {
        if (SideBarFocus == 4) return;
        SideBarFocus = 4;
        ConsoleBody.ClearChildren();

        var Preview = new Part("div", "preview-theme", ConsoleBody).SetProperties({
            width: "450px",
            height: "300px",
            border: "1px solid #000000",
            backgroundSize: "cover",
            backgroundColor: UITheme.Light
        });

        var Bottom = new Part("div", "preview-bottom", Preview).SetProperties({
            width: "451px",
            height: "20px",
            bottom: "0",
            backgroundColor: UITheme.Dark,
            left: "-1px",
        });

        new Part("br", "", ConsoleBody);

        new Part("span", "", ConsoleBody).SetContent("Background: ").SetProperties({
            fontSize: "16px",
            top: "310px"
        });
        var BackgroundInput = new Part("input", "background-input", ConsoleBody).SetProperties({
            fontSize: "16px",
            top: "310px",
            left: "90px"
        }); new Part("br", "", ConsoleBody);

        BackgroundInput.Element.value = UITheme.MPPBackground || "";

        new Part("span", "", ConsoleBody).SetContent("Bottom: ").SetProperties({
            fontSize: "16px",
            top: "340px"
        });
        var BottomInput = new Part("input", "", ConsoleBody).SetProperties({
            fontSize: "16px",
            top: "340px",
            left: "90px"
        }); new Part("br", "", ConsoleBody);

        BottomInput.Element.value = UITheme.MPPBottom || "";

        setInterval(function () {
            if (SideBarFocus == 4) {
                if (BackgroundInput.Element.value.length > 0) {
                    if (BackgroundInput.Element.value.indexOf("#") >= 0)
                        Preview.SetProperty("backgroundColor", BackgroundInput.Element.value);
                    else Preview.SetProperty("backgroundImage", "url(" + BackgroundInput.Element.value + ")");
                }

                if (BottomInput.Element.value.length > 0) {
                    if (BottomInput.Element.value.indexOf("#") >= 0)
                        Bottom.SetProperty("backgroundColor", BottomInput.Element.value);
                    else Bottom.SetProperty("backgroundImage", "url(" + BottomInput.Element.value + ")");
                }
            }
        })

        var Submit = new UIButton("Reset Theme", function () {
            UITheme.MPPForceTheme = false;
        }, ConsoleBody, 450, 25); new Part("br", "", ConsoleBody);

        Submit.Button.SetProperty("top", "390px");

        var Disable = new UIButton("Apply Theme", function () {
            UITheme.MPPForceTheme = true;
            UITheme.MPPBackground = BackgroundInput.Element.value || UITheme.Light;
            UITheme.MPPBottom = BottomInput.Element.value || UITheme.Dark;
        }, ConsoleBody, 450, 25);

        Disable.Button.SetProperty("top", "420px");
    }, Sidebar, 150, 25)); new Part("br", "", Sidebar);

    SideBarItems.push(new UIButton("Void Theme", function () {
        if (SideBarFocus == 5) return;
        SideBarFocus = 5;
        ConsoleBody.ClearChildren();

        new Part("span", "", ConsoleBody).SetContent("Background Light: ").SetProperties({
            fontSize: "16px",
            top: "0px"
        });
        var BackgroundLight = new Part("input", "", ConsoleBody).SetProperties({
            fontSize: "16px",
            top: "0px",
            left: "120px"
        }); new Part("br", "", ConsoleBody);
        var ColorLight = new Part("div", "", ConsoleBody).SetProperties({
            border: "1px solid #000000",
            top: "0px",
            left: "290px",
            width: "25px",
            height: "25px"
        });

        new Part("span", "", ConsoleBody).SetContent("Background Dark: ").SetProperties({
            fontSize: "16px",
            top: "30px"
        });
        var BackgroundDark = new Part("input", "", ConsoleBody).SetProperties({
            fontSize: "16px",
            top: "30px",
            left: "120px"
        }); new Part("br", "", ConsoleBody);
        var ColorDark = new Part("div", "", ConsoleBody).SetProperties({
            border: "1px solid #000000",
            top: "30px",
            left: "290px",
            width: "25px",
            height: "25px"
        });

        new Part("span", "", ConsoleBody).SetContent("Button Color: ").SetProperties({
            fontSize: "16px",
            top: "60px"
        });
        var ButtonColor = new Part("input", "", ConsoleBody).SetProperties({
            fontSize: "16px",
            top: "60px",
            left: "120px"
        }); new Part("br", "", ConsoleBody);
        var ColorButton = new Part("div", "", ConsoleBody).SetProperties({
            border: "1px solid #000000",
            top: "60px",
            left: "290px",
            width: "25px",
            height: "25px"
        });

        new Part("span", "", ConsoleBody).SetContent("Animated Color A: ").SetProperties({
            fontSize: "16px",
            top: "90px"
        });
        var AnimatedA = new Part("input", "", ConsoleBody).SetProperties({
            fontSize: "16px",
            top: "90px",
            left: "120px"
        }); new Part("br", "", ConsoleBody);
        var ColorAnimatedA = new Part("div", "", ConsoleBody).SetProperties({
            border: "1px solid #000000",
            top: "90px",
            left: "290px",
            width: "25px",
            height: "25px"
        });

        new Part("span", "", ConsoleBody).SetContent("Animated Color B: ").SetProperties({
            fontSize: "16px",
            top: "120px"
        });
        var AnimatedB = new Part("input", "", ConsoleBody).SetProperties({
            fontSize: "16px",
            top: "120px",
            left: "120px"
        }); new Part("br", "", ConsoleBody);
        var ColorAnimatedB = new Part("div", "", ConsoleBody).SetProperties({
            border: "1px solid #000000",
            top: "120px",
            left: "290px",
            width: "25px",
            height: "25px"
        });
        
        new Part("span", "", ConsoleBody).SetContent("Font Color: ").SetProperties({
            fontSize: "16px",
            top: "150px"
        });
        var FontColor = new Part("input", "", ConsoleBody).SetProperties({
            fontSize: "16px",
            top: "150px",
            left: "120px"
        }); new Part("br", "", ConsoleBody);
        var ColorFont = new Part("div", "", ConsoleBody).SetProperties({
            border: "1px solid #000000",
            top: "150px",
            left: "290px",
            width: "25px",
            height: "25px"
        });

        BackgroundLight.Element.value = UITheme.Light;
        BackgroundDark.Element.value = UITheme.Dark;
        ButtonColor.Element.value = UITheme.ButtonColor;
        AnimatedA.Element.value = UITheme.RotateA;
        AnimatedB.Element.value = UITheme.RotateB;
        FontColor.Element.value = UITheme.FontColor;

        setInterval(function () {
            if (SideBarFocus == 5) {
                ColorLight.SetProperty("backgroundColor", BackgroundLight.Element.value)
                ColorDark.SetProperty("backgroundColor", BackgroundDark.Element.value);
                ColorButton.SetProperty("backgroundColor", ButtonColor.Element.value)
                ColorAnimatedA.SetProperty("backgroundColor", AnimatedA.Element.value)
                ColorAnimatedB.SetProperty("backgroundColor", AnimatedB.Element.value)
                ColorFont.SetProperty("backgroundColor", FontColor.Element.value)
            }
        });

        var Reset = new UIButton("Reset", function () {
            UITheme.FontColor = "#009688";
            UITheme.Dark = "#141E24";
            UITheme.Light = "#21313B";
            UITheme.RotateA = "009688";
            UITheme.RotateB = "006296";
            UITheme.ButtonColor = "rgba(0, 255, 255, 0.1)";

            BackgroundLight.Element.value = UITheme.Light;
            BackgroundDark.Element.value = UITheme.Dark;
            ButtonColor.Element.value = UITheme.ButtonColor;
            AnimatedA.Element.value = UITheme.RotateA;
            AnimatedB.Element.value = UITheme.RotateB;
            FontColor.Element.value = UITheme.FontColor;
        }, ConsoleBody, 450, 25); new Part("br", "", ConsoleBody);

        Reset.Button.SetProperty("top", "390px");

        var Apply = new UIButton("Apply Theme", function () {
            UITheme.FontColor = FontColor.Element.value;
            UITheme.Dark = BackgroundDark.Element.value;
            UITheme.Light = BackgroundLight.Element.value;
            UITheme.RotateA = AnimatedA.Element.value.replace("#", "");
            UITheme.RotateB = AnimatedB.Element.value.replace("#", "");
            UITheme.ButtonColor = ButtonColor.Element.value;
            UITheme.ButtonTextColor = FontColor.Element.value;
        }, ConsoleBody, 450, 25);

        Apply.Button.SetProperty("top", "420px");
    }, Sidebar, 150, 25)); new Part("br", "", Sidebar);

    var PianoOctaves = 1;

    SideBarItems.push(new UIButton("Piano Settings", function () {
        if (SideBarFocus == 6) return;
        SideBarFocus = 6;
        ConsoleBody.ClearChildren();

        new Part("span", "", ConsoleBody).SetContent("Octaves: ").SetProperties({
            fontSize: "16px",
            top: "0px"
        });
        var Octaves = new Part("input", "", ConsoleBody).SetProperties({
            fontSize: "16px",
            top: "0px",
            left: "95px"
        }).SetAttributes({
            type: "number",
            min: "1",
            max: "7"
        }); new Part("br", "", ConsoleBody);
        Octaves.Element.value = "1";

        new Part("span", "", ConsoleBody).SetContent("Piano Display: ").SetProperties({
            fontSize: "16px",
            top: "30px"
        });
        var DisplayOn = new Part("input", "", ConsoleBody).SetProperties({
            fontSize: "16px",
            top: "35px",
            left: "95px"
        }).SetAttributes({
            type: "radio",
            name: "display"
        });
        DisplayOn.Element.checked = true;
        new Part("span", "", ConsoleBody).SetContent("On").SetProperties({
            fontSize: "16px",
            top: "30px",
            left: "110px"
        });
        var DisplayOff = new Part("input", "", ConsoleBody).SetProperties({
            fontSize: "16px",
            top: "35px",
            left: "135px"
        }).SetAttributes({
            type: "radio",
            name: "display"
        }); 
        new Part("span", "", ConsoleBody).SetContent("Off").SetProperties({
            fontSize: "16px",
            top: "30px",
            left: "150px"
        }); new Part("br", "", ConsoleBody);

        setInterval(function () {
            if (SideBarFocus == 6) {
                if (DisplayOff.Element.checked) {
                    document.getElementById("piano").style.display = "none";
                } else document.getElementById("piano").style.display = "block";

                PianoOctaves = Octaves.Element.value;
            }
        });
    }, Sidebar, 150, 25)); new Part("br", "", Sidebar);

    var ConsoleBody = new Part("div", "console-body", ConsoleUI).SetProperties({
        right: "10px",
        width: "490px",
        height: "450px",
        overflowY: "auto"
    });

    setInterval(function () {
        var Target = document.querySelector(".highlight");

        if (Target) {
            Target.style.border = "1px solid " + AnimatedColor(0);
        }
    });

    // Piano Patch
    var oldStart = MPP.client.startNote;
    MPP.client.startNote = function (note, vel) {
        if (PianoOctaves > 1) {
            var Octave = parseInt((note.match(/\-*[0-9]+/g) || "0")[0]);
            var Base = (note.match(/[a-z]/g) || []).join("");

            var Push = [];
            switch (parseInt(PianoOctaves)) {
                case 2:
                    Push.push(Base + (Octave - 1));
                    break;
                case 3:
                    Push.push(Base + (Octave - 1));
                    Push.push(Base + (Octave + 1));
                    break;
                case 4:
                    Push.push(Base + (Octave - 2));
                    Push.push(Base + (Octave - 1));
                    Push.push(Base + (Octave + 1));
                    break;
                case 5:
                    Push.push(Base + (Octave - 2));
                    Push.push(Base + (Octave - 1));
                    Push.push(Base + (Octave + 1));
                    Push.push(Base + (Octave + 2));
                    break;
                case 6:
                    Push.push(Base + (Octave - 3));
                    Push.push(Base + (Octave - 2));
                    Push.push(Base + (Octave - 1));
                    Push.push(Base + (Octave + 1));
                    Push.push(Base + (Octave + 2));
                    break;
                case 7:
                    Push.push(Base + (Octave - 3));
                    Push.push(Base + (Octave - 2));
                    Push.push(Base + (Octave - 1));
                    Push.push(Base + (Octave + 1));
                    Push.push(Base + (Octave + 2));
                    Push.push(Base + (Octave + 3));
                    break;
            }

            for (var i = 0; i < Push.length; i++) {
                var CheckOctave = parseInt((Push[i].match(/\-*[0-9]+/g) || "0")[0]);
                var CheckBase = (Push[i].match(/[a-z]/g) || []).join("");

                if (CheckBase.match(/[d-g]/g) && CheckOctave <= -1) CheckOctave = 6 - (CheckOctave + 1);
                if (CheckBase.match(/[a-b]/g) && CheckOctave <= -2) CheckOctave = 5 - (CheckOctave + 2);
                if (CheckBase == "c" && CheckOctave <= -1) CheckOctave = 6 - (CheckOctave + 1);
                if (CheckBase == "c" && CheckOctave == 8) CheckOctave = 1;
                if (CheckBase.match(/[a-b]/g) && CheckOctave >= 7) CheckOctave = 0;
                if (CheckBase.match(/[d-g]/g) && CheckOctave >= 7) CheckOctave = 0;
                if (CheckBase > 7) CheckOctave -= 8;

                Push[i] = CheckBase + CheckOctave;

                MPP.piano.play(Push[i], vel, MPP.client.getOwnParticipant(), 0, 0);
                oldStart.call(MPP.client, Push[i], vel);
            }
        }

        oldStart.call(MPP.client, note, vel);
    };

    // Background Update Patch
    MPP.client._events.ch.splice(6, 1);

    var old_color1 = new Color("#000000");
    var old_color2 = new Color("#000000");
    function setColor(hex, hex2) {
        var color1 = new Color(hex);
        var color2 = new Color(hex2 || hex);
        if(!hex2)
            color2.add(-0x40, -0x40, -0x40);

        var bottom = document.getElementById("bottom");
        
        var duration = 500;
        var step = 0;
        var steps = 30;
        var step_ms = duration / steps;
        var difference = new Color(color1.r, color1.g, color1.b);
        difference.r -= old_color1.r;
        difference.g -= old_color1.g;
        difference.b -= old_color1.b;
        var inc1 = new Color(difference.r / steps, difference.g / steps, difference.b / steps);
        difference = new Color(color2.r, color2.g, color2.b);
        difference.r -= old_color2.r;
        difference.g -= old_color2.g;
        difference.b -= old_color2.b;
        var inc2 = new Color(difference.r / steps, difference.g / steps, difference.b / steps);
        var iv;
        iv = setInterval(function() {
            old_color1.add(inc1.r, inc1.g, inc1.b);
            old_color2.add(inc2.r, inc2.g, inc2.b);
            document.body.style.background = "radial-gradient(ellipse at center, "+old_color1.toHexa()+" 0%,"+old_color2.toHexa()+" 100%)";
            bottom.style.background = old_color2.toHexa();
            if(++step >= steps) {
                clearInterval(iv);
                old_color1 = color1;
                old_color2 = color2;
                document.body.style.background = "radial-gradient(ellipse at center, "+color1.toHexa()+" 0%,"+color2.toHexa()+" 100%)";
                bottom.style.background = color2.toHexa();
            }
        }, step_ms);
    }

    MPP.client.on("ch", function (ch) {
        if (UITheme.MPPForceTheme) return;
        if (ch.ch.settings) {
            if (ch.ch.settings.color) {
                setColor(ch.ch.settings.color, ch.ch.settings.color2);
            }
        }
    });

    // Broken Text Box Patch
    document.addEventListener("focusin", function() {
        if (document.activeElement.type == "textarea" || document.activeElement.type == "text") {
            $(document).data("events")._keydown = $(document).data("events").keydown;
            $(document).data("events").keydown = null;

            $(document).data("events")._keyup = $(document).data("events").keyup;
            $(document).data("events").keyup = null;
            
            $(window).data("events")._keypress = $(window).data("events").keypress;
            $(window).data("events").keypress = null;
        }
    }, true);

    document.addEventListener("focusout", function(event) {
        if (event.target.type == "textarea" || event.target.type == "input") {
            if ($(document).data("events")._keydown != undefined) {
                $(document).data("events").keydown = $(document).data("events")._keydown;
                $(document).data("events").keyup = $(document).data("events")._keyup;
                $(window).data("events").keypress = $(window).data("events")._keypress;
        
                $(document).data("events")._keydown = undefined;
                $(document).data("events")._keydown = undefined;
                $(window).data("events")._keypress = undefined;
            }
        }
    }, true);

    // Void Command Bot
    var NetworkModule = new DetachableModule("NetworkModule");
    var ChannelModule = new DetachableModule("ChannelModule");
    var CommandModule = new DetachableModule("Commandmodule");
    var ServiceModule = new DetachableModule("ServiceModule");
    var PlayerModule = new DetachableModule("PlayerModule");
    var ChatModule = new DetachableModule("ChatModule");

    function WaitForModule(ModuleIn, CB) {
        ModuleIn.LoadFunctions.push(CB);
    }

    NetworkModule.Instantiate(function (DisposableMemory, PermanentMemory, StaticMemory) {
        StaticMemory.PacketsSent = 0;
        StaticMemory.BytesSent = 0;

        DisposableMemory.AttachedClient = MPP.client;
        DisposableMemory.Connected = function () {
            return typeof DisposableMemory.AttachedClient != "undefined" && DisposableMemory.AttachedClient.ws.readyState == 1;
        };

        StaticMemory.Connect = function () {
            if (!DisposableMemory.Connected() && typeof DisposableMemory.AttachedClient != "undefined")
                DisposableMemory.AttachedClient.start();
        };

        StaticMemory.Disconnect = function () {
            if (DisposableMemory.Connected())
                DisposableMemory.AttachedClient.stop();
        };

        StaticMemory.EventEnum = {
            CHATMESSAGE: 0,
            CHANNELUPDATE: 1,
            NOTES: 2,
            CHANNELLIST: 3,
            CLOSECHANNELLIST: 4,
            SERVERCONNECT: 5,
            SERVERDISCONNECT: 6,
            PLAYERJOIN: 7,
            PLAYERLEAVE: 8,
            PLAYERUPDATE: 9,
            SERVERTIME: 10,
            CHATMESSAGES: 11
        };

        StaticMemory.Event = class {

            constructor(Type, Data, Handler) {
                this.Type = Type;
                this.Data = Data;
                this.Handler = Handler;
            }

        };

        StaticMemory.InvokeServer = function (Event) {
            if (!DisposableMemory.Connected()) return;

            var ToSend = {};

            switch (Event.Type) {
                case StaticMemory.EventEnum.CHATMESSAGE:
                    ToSend.m = "a";
                    ToSend.message = Event.Data;
                    break;
                case StaticMemory.EventEnum.PLAYERUPDATE:
                    ToSend.m = "userset";
                    ToSend.set = Event.Data;
                    break;
                case StaticMemory.EventEnum.CHANNELUPDATE:
                    ToSend.m = "ch";
                    ToSend._id = Event.Data;
                    break;
                case StaticMemory.EventEnum.CHANNELLIST:
                    ToSend.m = "+ls";
                    break;
                case StaticMemory.EventEnum.CLOSECHANNELLIST:
                    ToSend.m = "-ls";
                    break;
                case StaticMemory.EventEnum.NOTES:
                case StaticMemory.EventEnum.SERVERCONNECT:
                case StaticMemory.EventEnum.SERVERDISCONNECT:
                case StaticMemory.EventEnum.PLAYERJOIN:
                case StaticMemory.EventEnum.PLAYERLEAVE:
                case StaticMemory.EventEnum.SERVERTIME:
                case StaticMemory.EventEnum.CHATMESSAGES: return;
                default: return;
            }

            DisposableMemory.AttachedClient.sendArray([ToSend]);
        };

        StaticMemory.OnEvent = function (Event) {
            var Target = "";

            switch (Event.Type) {
                case StaticMemory.EventEnum.CHATMESSAGE:
                    Target = "a";
                    break;
                case StaticMemory.EventEnum.CHANNELUPDATE:
                    Target = "ch";
                    break;
                case StaticMemory.EventEnum.NOTES:
                    Target = "n";
                    break;
                case StaticMemory.EventEnum.CHANNELLIST:
                    Target = "ls";
                    break;
                case StaticMemory.EventEnum.CLOSECHANNELLIST:
                    Target = "ls";
                    break;
                case StaticMemory.EventEnum.SERVERCONNECT:
                    Target = "hi";
                    break;
                case StaticMemory.EventEnum.SERVERDISCONNECT:
                    Target = "bye";
                    break;
                case StaticMemory.EventEnum.PLAYERJOIN:
                    Target = "participant added";
                    break;
                case StaticMemory.EventEnum.PLAYERLEAVE:
                    Target = "participant removed";
                    break;
                case StaticMemory.EventEnum.PLAYERUPDATE:
                    Target = "participant update";
                    break;
                case StaticMemory.EventEnum.SERVERTIME:
                    Target = "t";
                    break;
                case StaticMemory.EventEnum.CHATMESSAGES:
                    Target = "c";
                    break;
                default: return;
            }

            if (Target == "ls") {
                if (Event.Type == StaticMemory.EventEnum.CLOSECHANNELLIST) {
                    MPP.client.on("ls", function (Event2) {
                        if (!Event2.c) Event.Handler(Event2);
                    });
                } else {
                    MPP.client.on("ls", function (Event2) {
                        if (Event2.c) Event.Handler(Event2);
                    });
                }

                return;
            }

            MPP.client.on(Target, Event.Handler);
        };
    });

    PlayerModule.Instantiate(function (DisposableMemory, PermanentMemory, StaticMemory) {
        DisposableMemory.PlayerList = [];
        PermanentMemory.PlayerData = {};
        PermanentMemory.SaveToStorage = true;
        
        StaticMemory.FilterPlayerList = function (NamePrecise, NameImprecise, ID) {
            var Output = [];

            for (var i = 0; i < DisposableMemory.PlayerList.length; i++) {
                if (NamePrecise != null) {
                    if (DisposableMemory.PlayerList[i].Name == NamePrecise) {
                        Output.push(DisposableMemory.PlayerList[i]);
                    }
                }

                if (NameImprecise != null) {
                    if (DisposableMemory.PlayerList[i].Name.indexOf(NameImprecise) >= 0) {
                        Output.push(NameImprecise);
                    }
                }

                if (ID != null) {
                    if (DisposableMemory.PlayerList[i].ID == ID) {
                        Output.push(DisposableMemory.PlayerList[i]);
                    }
                }
            }

            return Output;
        };

        StaticMemory.CreatePlayer = function (PlayerObject) {
            return {
                Name: PlayerObject.name,
                ID: PlayerObject._id,
                TID: PlayerObject.id,
                Color: PlayerObject.color,
                Level: StaticMemory.GetPlayerLevel(PlayerObject._id)
            };
        }

        StaticMemory.PlayerJoined = function (PlayerObject) {
            DisposableMemory.PlayerList.push(StaticMemory.CreatePlayer(PlayerObject));

            if (!PermanentMemory.PlayerData.hasOwnProperty(PlayerObject._id))
                PermanentMemory.PlayerData[PlayerObject._id] = 1;
        };

        StaticMemory.PlayerLeft = function (PlayerID) {
            for (var i = 0; i < DisposableMemory.PlayerList.length; i++) {
                if (DisposableMemory.PlayerList[i].ID == PlayerID) {
                    DisposableMemory.PlayerList.splice(i, 1);
                }
            }
        };

        StaticMemory.SaveData = function () {
            localStorage.setItem("PlayerData", JSON.stringify(PermanentMemory));
        };

        StaticMemory.LoadData = function () {
            if (localStorage.getItem("PlayerData") != null) {
                PermanentMemory = JSON.parse(localStorage.getItem("PlayerData"));
            }
        };

        StaticMemory.GetPlayerLevel = function (PlayerID) {
            if (PlayerID == MPP.client.getOwnParticipant()._id) return 2;
            return PermanentMemory.PlayerData[PlayerID] || 1;
        };

        StaticMemory.HasAccess = function (PlayerID, AccessLevel) {
            if (typeof PlayerId == "number") return PlayerID >= AccessLevel;

            return StaticMemory.GetPlayerLevel(PlayerID) >= AccessLevel;
        };
    });

    ChannelModule.Instantiate(function (DisposableMemory, PermanentMemory, StaticMemory) {
        StaticMemory.ChannelList = [];
        PermanentMemory.SaveToStorage = false;

        StaticMemory.UpdateList = function (List) {
            StaticMemory.ChannelList = [];

            for (var i = 0; i < List.length; i++) {
                StaticMemory.ChannelList.push({
                    Name: List[i]._id,
                    PlayerCount: List[i].count,
                    Settings: List[i].settings,
                    Owner: (List[i].crown || {}).userId || ""
                });    
            }
        };

        StaticMemory.RequestListUpdate = function () {
            NetworkModule.InvokeServer(new NetworkModule.Event(NetworkModule.EventEnum.CHANNELLIST));

            NetworkModule.OnEvent(new NetworkModule.Event(NetworkModule.EventEnum.CHANNELLIST, null, function (Event) {
                StaticMemory.UpdateList(Event.u);
            }));

            NetworkModule.OnEvent(new NetworkModule.Event(NetworkModule.EventEnum.CLOSECHANNELLIST, null, function (Event) {
                StaticMemory.UpdateChannel(Event.u[0]);
            }));
        };

        StaticMemory.UpdateChannel = function (ChannelObject) {
            for (var i = 0; i < StaticMemory.ChannelList.length; i++) {
                if (StaticMemory.ChannelList[i].Name == ChannelObject._id) {
                    StaticMemory.ChannelList[i] = {
                        Name: List[i]._id,
                        PlayerCount: List[i].count,
                        Settings: List[i].settings,
                        Owner: List[i].crown.userId
                    };
                }
            }
        };
    });

    ChatModule.Instantiate(function (DisposableMemory, PermanentMemory, StaticMemory) {
        var Buffer = [];

        this.CreateRoutine(function () {
            console.log("Ro");
            var LastMessage = Buffer.shift();

            if (!LastMessage) return;

            if (LastMessage.length > 511) {
                var Before = LastMessage.slice(0, 511);

                Buffer.push("…" + LastMessage.slice(511));
                MPP.chat.send(LastMessage.slice(0, 511) + "…");
                return;
            }

            MPP.chat.send(LastMessage);
        }, 2000);

        StaticMemory.SendChat = function (Message) {
            Buffer.push(Message);  
        };

        WaitForModule(NetworkModule, function () {
            NetworkModule.OnEvent(new NetworkModule.Event(NetworkModule.EventEnum.CHATMESSAGE, null, function (Data) {
                CommandModule.ReceiveChat(Data.a, Data.p);
            }));
        });
    });

    var CommandPrefix = "@";
    CommandModule.Instantiate(function (DisposableMemory, PermanentMemory, StaticMemory) {
        PermanentMemory.CommandList = [];

        StaticMemory.ReceiveChat = function (Message, Sender) {
            if (Message.slice(0, CommandPrefix.length) == CommandPrefix) {
                var Command = Message.split(" ")[0].slice(CommandPrefix.length);
                var Parameters = Message.split(" ").slice(1);
                var Target = StaticMemory.FindCommand(Command);

                if (Target == null) {
                    ChatModule.SendChat("Unknown Command. Type " + CommandPrefix + "help for a list of commands.");
                    return;
                }

                if (PlayerModule.GetPlayerLevel(Sender._id) < Target.Level) {
                    ChatModule.SendChat("You must be level " + Target.Level + " to access this command! [AL=" + PlayerModule.GetPlayerLevel(Sender._id) + "]");
                    return;
                }

                try {
                    Target.Handler(Parameters, PlayerModule.CreatePlayer(Sender));
                } catch (e) {
                    ChatModule.SendChat("An error occurred while invoking command " + Command + "! Check the console to view the error");
                    console.log(e); // Todo Create an error log in console gui
                }
            }
        };

        StaticMemory.RegisterCommand = function (CommandHandler, CommandName, CommandLevel) {
            PermanentMemory.CommandList.push({
                Name: CommandName,
                Handler: CommandHandler,
                Level: CommandLevel
            });
        };

        StaticMemory.FindCommand = function (CommandName) {
            for (var i = 0; i < PermanentMemory.CommandList.length; i++) {
                if (PermanentMemory.CommandList[i].Name == CommandName) {
                    return PermanentMemory.CommandList[i];
                }
            }

            return null;
        };

        // Default Commands
        StaticMemory.RegisterCommand(function (Parameters, User) {
            if (!isNaN(Parameters[0])) {

            } else {
                var Commands = PermanentMemory.CommandList.filter(function (Command) {
                    return Command.Level <= User.Level;
                }).map(function (Command) {
                    return Command.Name;
                });

                ChatModule.SendChat("Commands you have access to [AL=" + User.Level + "]: " + Commands.join(", "));
            }
        }, "help", 1);

        StaticMemory.RegisterCommand(function (Parameters, User) {
            Wipe = Parameters[0] == "wipe=true";
            if (Parameters[0] == "NetworkModule") {
                NetworkModule.Restart(Wipe);

                setTimeout(function () {
                    NetworkModule.LoadComplete();
                    ChatModule.SendChat("Modules Restarted");
                }, 1000);
            }
            else if (Parameters[0] == "ChannelModule") {
                ChannelModule.Restart(Wipe);

                setTimeout(function () {
                    ChannelModule.LoadComplete();
                    ChatModule.SendChat("Modules Restarted");
                }, 1000);
            }
            else if (Parameters[0] == "CommandModule") {
                CommandModule.Restart(Wipe);

                setTimeout(function () {
                    CommandModule.LoadComplete();
                    ChatModule.SendChat("Modules Restarted");
                }, 1000);
            }
            else if (Parameters[0] == "ServiceModule") {
                ServiceModule.Restart(Wipe);

                setTimeout(function () {
                    ServiceModule.LoadComplete();
                    ChatModule.SendChat("Modules Restarted");
                }, 1000);
            }
            else if (Parameters[0] == "PlayerModule") {
                PlayerModule.Restart(Wipe);

                setTimeout(function () {
                    PlayerModule.LoadComplete();
                    ChatModule.SendChat("Modules Restarted");
                }, 1000);
                
            }
            else if (Parameters[0] == "ChatModule") {
                ChatModule.Restart(Wipe);

                setTimeout(function () {
                    ChatModule.LoadComplete();
                    ChatModule.SendChat("Modules Restarted");
                }, 1000);
            }
            else if (Parameters[0] == "all") {
                NetworkModule.Restart(Wipe);
                ChannelModule.Restart(Wipe);
                CommandModule.Restart(Wipe);
                ServiceModule.Restart(Wipe);
                PlayerModule.Restart(Wipe);
                ChatModule.Restart(Wipe);

                setTimeout(function () {
                    NetworkModule.LoadComplete();
                    ChannelModule.LoadComplete();
                    CommandModule.LoadComplete();
                    ServiceModule.LoadComplete();
                    PlayerModule.LoadComplete();
                    ChatModule.LoadComplete();

                    ChatModule.SendChat("Modules Restarted");
                }, 1000);
            }
            else ChatModule.SendChat("Unknown module");
        }, "restart_module", 2);

        StaticMemory.RegisterCommand(function (Parameters, Sender) {
            try {
                ChatModule.SendChat("Output: " + JSON.stringify(eval(Parameters.join(" "))));
            } catch (e) {
                ChatModule.SendChat(e.toString());
            }
        }, "js", 2);

    });

    ServiceModule.Instantiate(function (DisposableMemory, PermanentMemory, StaticMemory) {
    });

    setTimeout(function () {
        NetworkModule.LoadComplete();
        ChannelModule.LoadComplete();
        CommandModule.LoadComplete();
        ServiceModule.LoadComplete();
        PlayerModule.LoadComplete();
        ChatModule.LoadComplete();

        ChatModule.SendChat(BotName + " " + BotVersion + " by " + BotDeveloper);
    }, 1500);
}
