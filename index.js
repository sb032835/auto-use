


/*You can get skill ID's from https://moongourd.com/info or do /proxy au debug and use the skill, it will print on your console.
Recommanded to note the skill name in same order so you don't get confused :3 */

/* --------------------------------------------- NO EDITO BELOW THIS --------------------------------------------- */

const skills = require('./skills');

module.exports = function Lazyrootbeer(mod){	

let enabled = true,								
	debug = false,								
	brooch = {									
		id : [51028, 98406, 98405, 98404],		
		cooldown : 0
	},											
	rootbeer = {
		id : 80081,
		amount : 0,
		cooldown : 0
	},
	useBroochOn,
	useRootBeerOn,
	useOutOfCombat,
	delay;

	mod.command.add('au', (arg) => {
		if(arg){
			arg = arg.toLowerCase();
			if(arg === 'on'){
				enabled = true;
				mod.command.message(`<font color="#56B4E9">開啟</font>`);
			}
			else if(arg === 'off'){
				enabled = false;
				mod.command.message(`<font color="#56B4E9">關閉</font>`);
			}
			else if(arg === 'debug'){
				debug = !debug;
				mod.command.message(`Debug Status : ${debug}`);
			}
			else if(arg === 'help'){
				mod.command.message(`Commands : debug | on | off`)
			}
		}
		else mod.command.message(`Commands : debug | on | off`);
	});

	let useItem = (item, loc, w) => {
		mod.send('C_USE_ITEM', 3, {
			gameId: mod.game.me.gameId,
			id: item,
			dbid: 0,
			target: 0,
			amount: 1,
			dest: { x: 0, y: 0, z: 0 },
			loc: loc,
			w: w,
			unk1: 0,
			unk2: 0,
			unk3: 0,
			unk4: true
        });
        if(debug) console.log('使用 : ' + item);
	};

	let handle = (info) => {
		if((useOutOfCombat || mod.game.me.inCombat) && !mod.game.me.inBattleground){
			if(useBroochOn.includes(info.skill.id) && Date.now() > brooch.cooldown)
				setTimeout(useItem, delay, brooch.id, info.loc, info.w);
			if(useRootBeerOn.includes(info.skill.id) && rootbeer.amount > 0 && Date.now() > rootbeer.cooldown) 
				setTimeout(useItem, delay, rootbeer.id, info.loc, info.w);
		}
	}; 

	mod.game.on('enter_game', () => {
        useBroochOn = skills[mod.game.me.class].useBroochOn;
        useRootBeerOn = skills[mod.game.me.class].useRootBeerOn;
        useOutOfCombat = skills[mod.game.me.class].useOutOfCombat;
        delay = skills[mod.game.me.class].delay;
    });

 	mod.hook('C_USE_ITEM', 3, event => {
 		if(debug) console.log('使用: ' + event.id);
 	});

	mod.hook('S_INVEN', 16, event => {
		if(!enabled) return;
		const broochinfo = event.items.find(item => item.slot === 20);
		const beer = event.items.find(item => item.id === rootbeer.id);
		if(broochinfo) brooch.id = broochinfo.id;
		if(beer) rootbeer.amount = beer.amount;
	});

	mod.hook('C_START_SKILL', 7, {order: Number.NEGATIVE_INFINITY}, event => {
		if(debug){
			const Time = new Date();
			console.log('時間: ' + Time.getHours() + ':' + Time.getMinutes() + ' | 技能 ID : ' + event.skill.id);
		}
		if(!enabled) return;
		handle(event);
	});

	mod.hook('S_START_COOLTIME_ITEM', 1, {order: Number.NEGATIVE_INFINITY}, event => {
		if(!enabled) return;
		if(event.item === brooch.id) brooch.cooldown = Date.now() + event.cooldown*1000;
		else if(event.item === rootbeer.id) rootbeer.cooldown = Date.now() + event.cooldown*1000;
	});
}
