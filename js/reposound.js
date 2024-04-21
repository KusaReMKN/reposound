'use strict';

async function
updateRepoList(ev)
{
	ev.preventDefault();

	const username = ev.target.value;
	const result = await fetch(
		`https://api.github.com/users/${username}/repos`,
		{
			headers: {
				'accept': 'application/vnd.github+json',
			},
		});
	if (!result.ok) {
		ev.target.setCustomValidity(
			`User or organisation '${username}' probably does not exist`
		);
		ev.target.reportValidity();
		return;
	}
	const data = await result.json();
	const options = data.map(e => {
		const option = document.createElement('option');
		option.value = e.name;
		return option;
	});

	window.repolist.parentNode.replaceChild(
		window.repolist.cloneNode(false),
		window.repolist
	);
	window.repolist.append(...options);
}

owner.addEventListener('change', updateRepoList);
owner.addEventListener('blur', updateRepoList);

async function
generateSound(ev)
{
	ev.preventDefault();

	const owner = window.owner.value;
	const repo = window.repo.value;
	const result = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`,
		{
			headers: {
				'accept': 'application/vnd.github+json',
			},
		});
	if (!result.ok) {
		window.repo.setCustomValidity(
			`Repository '${owner}/${repo}' probably does not exist`
		);
		window.repo.reportValidity();
		return false;
	}
	const data = await result.json();
	const weeks = data.map(e => e.total);

	const scale = 10;
	const ctx = window.spectram.getContext('2d');
	ctx.canvas.width = weeks.length * scale;
	ctx.canvas.height = Math.max(...weeks) * scale;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.setTransform(1, 0, 0, -1, 0, ctx.canvas.height);
	ctx.beginPath();
	ctx.moveTo(0, 0);
	weeks.forEach((e, i) => ctx.lineTo((i+1) * scale, e * scale));
	ctx.stroke();

	const ac = new AudioContext();
	const osc = ac.createOscillator();

	const real = weeks.map(e => e/Math.max(...weeks));
	const imag = weeks.map(e => 0);
	const wave = ac.createPeriodicWave(real, imag);
	osc.setPeriodicWave(wave);
	osc.connect(ac.destination);
	osc.start();
	osc.stop(2);

	return false;
}

choose.addEventListener('submit', generateSound);
