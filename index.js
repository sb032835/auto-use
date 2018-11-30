				
				
/*You can get skill ID's from https://moongourd.com/info or do /proxy au debug and use the skill, it will print on your console.
Recommanded to note the skill name in same order so you don't get confused :3 */

/* --------------------------------------------- NO EDITO BELOW THIS --------------------------------------------- */

const skills = require('./skills');
	

module.exports = function AutoUse(mod){

let enabled = true,
	debug = false,
	brooch = {
		id : 0,
		cooldown : 0
	},
	rootbeer = {
		id : 80081,
		amount : 0,
		cooldown : 0
	},
	useBroochOn,
	useRootBeerOn,
	useOutOfCombat;
	
	mod.command.add('au', (arg) => {
		if(arg){
			arg = arg.toLowerCase();
			if(arg === 'on'){
				enabled = true;
				mod.command.message('[Auto Use]<font color="#56B4E9">開啟</font>');
			}
			else if(arg === 'off'){
				enabled = false;
				mod.command.message('[Auto Use]<font color="#E69F00">關閉</font>');
			}
			else if(arg === 'debug'){
				debug = !debug;
				mod.command.message(`[Auto Use] Debug Status : ${debug}`);
			}
			else if(arg === 'help'){
				mod.command.message('[Auto Use] Commands : debug | on | off')
			}
		}
		else mod.command.message('[Auto Use] Commands : debug | on | off');
	});

	let useItem = (item, loc, w) => {
		mod.send('C_USE_ITEM', 3, {
			gameId: mod.game.me.gameId,
			id: item,
			amount: 1,
			loc: loc,
			w: w,
			unk4: true
        });
        if(debug) console.log('Used : ' + item);
	};

	let handle = (info) => {
		if((useOutOfCombat || mod.game.me.inCombat) && !mod.game.me.inBattleground){
			if(useBroochOn.includes(info.skill.id) && Date.now() > brooch.cooldown) useItem(brooch.id, info.loc, info.w);
			if(useRootBeerOn.includes(info.skill.id) && rootbeer.amount > 0 && Date.now() > rootbeer.cooldown) useItem(rootbeer.id, info.loc, info.w);
		}
	}; 

	mod.game.on('enter_game', () => {
        useBroochOn = skills[mod.game.me.class].useBroochOn;
        useRootBeerOn = skills[mod.game.me.class].useRootBeerOn;
        useOutOfCombat = skills[mod.game.me.class].useOutOfCombat;
    });

 	mod.hook('C_USE_ITEM', 3, event => {
 		if(debug) console.log('ID of Item Used: ' + event.id);
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
			console.log('Time: ' + Time.getHours() + ':' + Time.getMinutes() + ' | Skill ID : ' + event.skill.id);
		}
		if(!enabled) return;
		handle(event);
	});

	mod.hook('S_START_COOLTIME_ITEM', 1, {order: Number.NEGATIVE_INFINITY}, event => {
		if(!enabled) return;
		if(BigInt(event.item) === brooch.id) brooch.cooldown = Date.now() + event.cooldown*1000;
		else if(BigInt(event.item) === rootbeer.id) rootbeer.cooldown = Date.now() + event.cooldown*1000;
	});

}
