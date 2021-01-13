class Digimon {
    constructor(name){
        this.name = name;
        this.stage;
        this.img;
        this.evolvesInto;
        this.evolvesFrom;
        this.requirements;
    }

    static EvoData = null;
    static FullData = null;
    static Dub = true;

    static async getData() {
        let status; 
        this.Dub ? status = "dub" : status = "sub";
        const response = await fetch(`/${status}-data.json`);
        const evoData = await response.json();
        return evoData;
    }

    static async fetchJSON() {
        const evoData = await this.getData();
        return evoData;
    }

    static async createNameList(data) {
        let nameList = [];
        const evoData = new Map(Object.entries(data.evolutionary_levels));
        this.EvoData = evoData;
        for(let [key, value] of evoData){
            nameList.push(key);
            nameList.push(...value);
        }
        const fullData = new Map(Object.entries(data));
        this.FullData = fullData;
        return await nameList;
    }

    static async populateObj(name, obj){
        for(let [key, value] of Digimon.EvoData){
            let nameBool = value.find(element => element === name);
            if(nameBool !== undefined){
                obj.stage = key;
                break;
            }
        }
        const evosObj = Digimon.FullData.get("evolutions");
        const evosMap = new Map(Object.entries(evosObj));

        for(let [key, value] of evosMap){
            if (key === name){
                obj.evolvesInto = value;
                break;
            }
        }
        const requirementsMap = new Map(Object.entries(Digimon.FullData.get("information")));
        for(let [key, value] of requirementsMap){
            if(key === name){
                obj.requirements = value;
                break;
            }
        }

        if((!name.includes("Egg") || !name.includes("Digitama")) && (name !== "Sukamon" || name !== "Scumon")){
            let evolvesFrom = [];
            let stages;
            if(Digimon.Dub === true){
                stages = ["Digi-Egg", "Baby", "In-training", "Rookie", "Champion", "Ultimate", "Mega", "X-Antibody"];
            } else {
                stages = ["Digitama", "Baby I", "Baby II", "Child", "Adult", "Perfect", "Ultimate", "X-Antibody"];
            }
            let previousStageIndex = stages.indexOf(obj.stage) - 1;
            let previousStage = stages[previousStageIndex];
            
            let previousStageMons = this.EvoData.get(previousStage);
            if(previousStageMons !== undefined){
                for(let i = 0; i < previousStageMons.length; i++){
                    let evolvesIntoArr = await Digimon.FullData.get("evolutions")[previousStageMons[i]];
                    if(evolvesIntoArr !== undefined){
                        let doesDigiExists =  await evolvesIntoArr.includes(name);
                        if(doesDigiExists === true){
                            await evolvesFrom.push(previousStageMons[i]);
                        }
                    }
                }
            }

            if(name === "Lucemon Falldown Mode"){
                obj.evolvesFrom = ["Lucemon"];
            } else {
                obj.evolvesFrom = await evolvesFrom;
            }

        }
        let imageDir;
        this.Dub ? imageDir = "./imgs/sprites/" : imageDir = "./imgs/sub_sprites/";
        if(name === "Sukamon" || name === "Scumon"){
            obj.img = await imageDir + name.toLowerCase() + ".png";
        }

        if(!name.includes("Egg") && !name.includes("Digitama") || name === "Digitamamon") {
            let imgStr = await imageDir + name.toLowerCase() + ".png";
            obj.img = await imgStr;
        }

    }
};

const selectView = {
    init: async function(data){
        const selectDrop = document.querySelector("#select");
        this.populateMenu(data, selectDrop);
    },
    populateMenu: function(data, menu){
        let stages;
        if(Digimon.Dub === true){
            stages = ["Digi-Egg", "Baby", "In-training", "Rookie", "Champion", "Ultimate", "Mega", "X-Antibody"];
        } else {
            stages = ["Digitama", "Baby I", "Baby II", "Child", "Adult", "Perfect", "Ultimate", "X-Antibody"];
        }
        if(menu.children.length > 0){
            while (menu.hasChildNodes()){
                menu.removeChild(menu.firstChild);
            }
        }
        data.forEach(name => {
            let option;
            let nameBool = stages.find(element => element === name);
            if(nameBool !== undefined){
                option = this.populateOptions(name, true);
                menu.append(option);
            } else {
                let monOption = this.populateOptions(name, false);
                menu.append(monOption);
            }

        });
    },
    populateOptions: function(text, bool){
        const option = document.createElement("option");
        option.textContent = text;
        option.value = text;
        option.disabled = bool;
        return option;
    },
    insertAfter: function(newNode, existingNode){
        existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
    },
    populateSmallerMenu: function(list, btn){
        if (document.querySelector(".container").children[5].nodeName === "SELECT"){
            this.clearSmallerSelect();
        }
        let collection = btn.parentNode;
        let menu = document.createElement("select");
        menu.classList.add("form-select", "form-select-md", "select");
        menu.size = 7;
        menu.onchange = controller.onSelection.bind(this);
        collection.insertAdjacentElement('afterend', menu);
        list.forEach(mon => {
            let option = this.populateOptions(mon, false);
            menu.appendChild(option);
        });
    },
    clearSmallerSelect: function(){
        let body = document.querySelector(".container");
        let menu = body.children[5];
        body.removeChild(menu);
    },
    nameBtns: function(){
        let collection = document.querySelector(".stage-collection");
        let stages;
        if(Digimon.Dub === true){
            stages = ["Digi-Egg", "Baby", "In-training", "Rookie", "Champion", "Ultimate", "Mega", "X-Antibody"];
        } else {
            stages = ["Digitama", "Baby I", "Baby II", "Child", "Adult", "Perfect", "Ultimate", "X-Antibody"];
        }

        Array.from(collection.children).forEach((btn, index )=> {
            stages.forEach((stage, index2)=> {
                if (index === index2){
                    btn.textContent = stage;
                }
            });
        });
    }
};

const digiInfoView = {
    init: function(info){
        const name = document.querySelector("#name");
        const stage = document.querySelector("#stage");
        const sprite = document.querySelector("#sprite");
        this.populateInfobox(info, name, stage, sprite)
    },
    populateInfobox: function(info, name, stage, sprite){
        console.log(info);
        name.textContent = info.name;
        
        if(!info.name.includes("Digi-Egg") && !info.name.includes("Digitama") || info.name === "Digitamamon"){
            stage.textContent = info.stage;
            sprite.src = info.img;
            sprite.alt = info.name;
        } else {
            sprite.src = "";
            sprite.alt = "";
            stage.textContent = "";
        }
        
    },
    clearBox: function(){
        const name = document.querySelector("#name");
        const stage = document.querySelector("#stage");
        const sprite = document.querySelector("#sprite");
        name.textContent = "";
        sprite.src = "";
        sprite.alt = "";
        stage.textContent = "";
    }
};

const evolvesFromView = {
    init: function(info){
        const evolvesFromBox = document.querySelector("#evolves-from");
        this.populateView(info, evolvesFromBox);
    },
    populateView(info, box){
        let evolvesFromInfo;
        info.evolvesFrom !== undefined ?  evolvesFromInfo = info.evolvesFrom : evolvesFromInfo = false;
        if(info.name === "Sukamon" || info.name === "Scumon"){
            this.clearBox(box);
        }
        if(box.children.length > 0) {
            this.clearBox(box);
        }
        if(evolvesFromInfo === false || evolvesFromInfo.length === 0){
            return;
        }
        
        let heading = document.createElement("h3");
        Digimon.Dub ? heading.textContent = "Digivolves From" : heading.textContent = "Evolves From";

        heading.classList.add("h3"); 
        if(info.stage === "Baby"){
            heading.textContent = "Hatched From";
        }
        box.append(heading);

        if(evolvesFromInfo !== false && (info.stage !== "Baby" && info.stage !== "Baby I")){
            evolvesFromInfo.forEach(digimon => {
                let btn = document.createElement("button");
                let img = document.createElement("img");
                let name = document.createElement("p");
                btn.className = "evolvesFromBtn";
                btn.onclick = controller.clickMon;
                box.append(btn);
                let imgDir;
                Digimon.Dub ? imgDir = "./imgs/sprites/" : imgDir = "./imgs/sub_sprites/";
                img.src = imgDir + digimon.toLowerCase() + ".png";
                img.alt = digimon;
                name.textContent = digimon;
                btn.append(img);
                btn.append(name);
            });
        }

        if(info.stage === "Baby" || info.stage === "Baby I") {
            let btn = document.createElement("button");
            let name = document.createElement("p");
            btn.className = "evolvesFromBtn";
            btn.onclick = controller.clickMon;
            box.append(btn);
            name.textContent = evolvesFromInfo[0];
            btn.append(name);

        }

    },
    clearBox: function(box){
        while (box.hasChildNodes()){
            box.removeChild(box.firstChild);
        }
    }
};

const evolvesToView = {
    init: function(info){
        let evolvesToDiv = document.querySelector("#evolves-to");
        if(evolvesToDiv.children.length > 1) {
            this.clearBox(evolvesToDiv);
        }

        if(info.evolvesInto !== undefined) {
            const heading = document.createElement("h3");
            if (info.stage === "Digi-Egg" || info.stage === "Digitama"){
                heading.textContent = "Hatches Into";
                heading.classList.add("h3");
                this.populateView(info, evolvesToDiv, heading);
            } else {
                this.populateView(info, evolvesToDiv, heading);
            }

        }
    },
    populateView: function(info, box, heading){
        if(box.children.length > 1) {
            this.clearBox(box);
        }
        if(info.stage !== "Digi-Egg" && info.stage !== "Digitama"){
            Digimon.Dub ? heading.textContent = "Digivolves Into" : heading.textContent = "Evolves Into";
        }
        box.append(heading);
        info.evolvesInto.forEach(digimon => {
            let btn = document.createElement("button");
            let img = document.createElement("img");
            let name = document.createElement("p");
            btn.className = "evolvesFromBtn";
            btn.onclick = controller.clickMon;
            box.append(btn);
            let imgDir;
            Digimon.Dub ? imgDir = "./imgs/sprites/" : imgDir = "./imgs/sub_sprites/";
            img.src = imgDir + digimon.toLowerCase() + ".png";
            img.alt = digimon;
            name.textContent = digimon;
            btn.append(img);
            btn.append(name);
        })
    },
    clearBox: function(box){
        while (box.hasChildNodes()){
            box.removeChild(box.firstChild);
        }
    }
};

const requirementsView = {
    init: function(info){
        let table = document.querySelector("#table");
        let tableHeading = document.querySelector("#requirements-heading");
        let statsHeadingRow = document.querySelectorAll(".stats-heading-row");
        let statsBodyRow = document.querySelectorAll(".requirements-row-body");
        this.toggleTrStyle(info.stage);
        statsHeadingRow.forEach(row => row.children.length > 0 ? this.clearBox(tableHeading, statsHeadingRow, statsBodyRow) : false);

        if((info.stage !== "Digi-Egg" && info.stage !== "Digitama") && (info.stage !== "Baby" && info.stage !== "Baby I")
        && (info.stage !== "In-training" && info.stage !== "Baby II")) {
            let reduced;
            Digimon.Dub ? tableHeading.textContent = "Requirements to Digivolve Into" : tableHeading.textContent = "Requirements to Evolve Into";

            if(window.screen.width > 1000){
                this.populateHead(info.requirements, statsHeadingRow);
                this.populateBody(info.requirements, statsBodyRow);
            } else if(window.screen.width > 770 && window.screen.width < 1000 ) {
                reduced = this.reduceRequirements(info.requirements, 10);
                document.querySelector(".tableTwo") ? true : this.createSecondTable(table);
                statsHeadingRow = document.querySelectorAll(".stats-heading-row");
                statsBodyRow = document.querySelectorAll(".requirements-row-body");
                statsHeadingRow.forEach(row => row.children.length > 0 ? this.clearBox(tableHeading, statsHeadingRow, statsBodyRow) : false);
                this.populateHead(reduced, statsHeadingRow);
                this.populateBody(reduced, statsBodyRow);
            } else if(window.screen.width < 770 && window.screen.width > 500){
                reduced = this.reduceRequirements(info.requirements, 8);
                document.querySelector(".tableTwo") ? true : this.createSecondTable(table);
                statsHeadingRow = document.querySelectorAll(".stats-heading-row");
                statsBodyRow = document.querySelectorAll(".requirements-row-body");
                statsHeadingRow.forEach(row => row.children.length > 0 ? this.clearBox(tableHeading, statsHeadingRow, statsBodyRow) : false);
                this.populateHead(reduced, statsHeadingRow);
                this.populateBody(reduced, statsBodyRow);
            } else if(window.screen.width < 500) {
                tableHeading.nextElementSibling.classList.remove("table");
                this.populateHead(info.requirements, statsHeadingRow);
                this.populateBody(info.requirements, statsBodyRow);
            }
        }


    },
    reduceRequirements: function(requirements, amount){
        let arr = [...Object.entries(requirements)];
        let reducedOne = arr.slice(0,amount);
        let objOne = {};
        let objTwo = {};
        reducedOne.forEach(statPair => {
            objOne[statPair[0]] = statPair[1];
        });
        
        let reducedTwo = arr.slice(amount,arr.length - 1);
        reducedTwo.forEach(statPair => {
            objTwo[statPair[0]] = statPair[1];
        });
        let reduced = [objOne, objTwo];
        return reduced;
    },
    populateHead: function(info,row){
        if (info.length !== undefined && info.length > 0){
            info.forEach((part, index) => {
                let stats = Object.keys(part);
                if(index === 0) {
                    stats.forEach(key => {
                        let th = document.createElement("th");
                        th.textContent = key;
                        th.scope = "col";
                        row[0].appendChild(th);
                    }); 
                }
                if(index === 1){
                    stats.forEach(key => {
                        let th = document.createElement("th");
                        th.textContent = key;
                        th.scope = "col";
                        row[1].appendChild(th);
                    }); 
                }

            });
        } else {
            let stats = Object.keys(info);
            stats.forEach(key => {
                let th = document.createElement("th");
                th.textContent = key;
                th.scope = "col";
                row[0].appendChild(th);
            })
        }

    },
    populateBody: function(info, body){
        if(info.length !== undefined && info.length > 0){
            info.forEach((part, index) => {
                const stats = Object.values(part);
                if(index === 0){
                    stats.forEach(stat=> {
                        let td = document.createElement("td");
                        td.textContent = stat;
                        td.style.backgroundColor = "white";
                        body[0].appendChild(td);
                    });
                }
                if(index === 1){
                    stats.forEach(stat=> {
                        let td = document.createElement("td");
                        td.textContent = stat;
                        td.style.backgroundColor = "white";
                        body[1].appendChild(td);
                    });
                }
            });
        } else {
            const stats = Object.values(info);
            body.forEach(row => row.style.border = "none");
            stats.forEach((stat, index) => {
                let td = document.createElement("td");
                td.textContent = stat;
                td.className = "space";
                td.style.backgroundColor = "white";
                body[0].appendChild(td);

                if(info.hasOwnProperty('Special Condition') 
                    && window.screen.width < 500 && index === 0) {
                    const firstTd = document.querySelector(".space");
                    firstTd.style.backgroundColor = "white";
                    firstTd.classList.toggle("space");
                    firstTd.classList.toggle("firstTd");
                } 
            });
        }

    },
    clearBox: function(heading, stats, statsBody){
        heading.textContent = "";
        stats.forEach(element => {
            while(element.hasChildNodes()){
                element.removeChild(element.firstChild);
            }
        });
        statsBody.forEach(element => {
            while(element.hasChildNodes()){
                element.removeChild(element.firstChild);
            }
        });
    },
    count: 0,
    toggleTrStyle: function(stage){
        let tr = document.querySelector(".requirements-row-body");
        this.count++;
        if(this.count === 1 || ((stage === "Digi-Egg" || stage === "Digitama") || (stage === "Baby" || stage === "Baby I")
        || (stage === "In-training" || stage === "Baby II"))){
            tr.classList.toggle("toggle-tr");
        } 

    },
    createSecondTable: function(tableOne){
        const tableDiv = document.createElement("div");
        const table = document.createElement("table");
        const tableHead = document.createElement("thead");
        const tableRow = document.createElement("tr");
        const tableBody = document.createElement("tbody");
        const tableBRow = document.createElement("tr");
        tableDiv.className = "table-responsive";
        tableRow.className = "table-dark stats-heading-row";
        tableBRow.className = "requirements-row-body";
        table.className = "table tableTwo";
        tableDiv.appendChild(table);
        table.appendChild(tableHead);
        tableHead.appendChild(tableRow);
        tableBody.appendChild(tableBRow);
        table.appendChild(tableBody);
        tableOne.insertAdjacentElement('afterend', tableDiv);
    },
}
const controller = {
    init: async function(){
        let rawData = await Digimon.fetchJSON();
        let data = await Digimon.createNameList(rawData);
        selectView.nameBtns();
        await selectView.init(data);
    },
    clickMon: async function(event){
        let name = event.target.parentElement.textContent;
        let info = await new Digimon(name);
        await Digimon.populateObj(name, info);
        controller.populate(info);
    },
    onSelection: async function(event){
        if(event.type === "change"){
            const name = event.target.value;
            let info = await new Digimon(name);
            await Digimon.populateObj(name, info);
            controller.populate(info);
        } else{
            const name = event.value;
            let info = await new Digimon(name);
            await Digimon.populateObj(name, info);
            this.populate(info);
        }

    },
    populate: function(digimon){
        digiInfoView.init(digimon);
        evolvesFromView.init(digimon);
        requirementsView.init(digimon);
        evolvesToView.init(digimon);
    },
    createSmallerDrop: function(event){
        const stage = event.textContent;
        const list = Digimon.EvoData.get(stage);
        selectView.populateSmallerMenu(list, event);
    },
    toggleBox: function(event){
        let box = event.previousElementSibling;
        box.classList.toggle("toggle-box");
    },
    toggleSubDub: function(){
        Digimon.Dub = !Digimon.Dub;
        let title = document.querySelector(".title");
        Digimon.Dub ? title.textContent = "Digivolution" : title.textContent = "Evolution";
        let tabTitle = document.querySelector("title");
        Digimon.Dub ? tabTitle.textContent = "Digimon Decode Digivolution App" : tabTitle.textContent = "Digimon Decode Evolution App";
        this.clearAll();
        this.init();
    },
    clearAll: function(){
        digiInfoView.clearBox();
        const evolvesFromBox = document.querySelector("#evolves-from");
        evolvesFromView.clearBox(evolvesFromBox);
        let tableHeading = document.querySelector("#requirements-heading");
        let statsHeadingRow = document.querySelectorAll(".stats-heading-row");
        let statsBodyRow = document.querySelectorAll(".requirements-row-body");
        statsHeadingRow.forEach(row => row.children.length > 0 ? requirementsView.clearBox(tableHeading, statsHeadingRow, statsBodyRow) : false);
        let evolvesToDiv = document.querySelector("#evolves-to");
        if(evolvesToDiv.children.length > 1) {
            evolvesToView.clearBox(evolvesToDiv);
        };
        if (document.querySelector(".container").children[5].nodeName === "SELECT"){
            selectView.clearSmallerSelect();
        };
    }
}

controller.init();