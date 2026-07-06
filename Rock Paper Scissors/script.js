const choices = ['rock', 'paper', 'scissors']
const winningCombos = {
	rock: 'scissors',
	paper: 'rock',
	scissors: 'paper'
}

const icons = {
	rock: '🪨 Rock',
	paper: '📄 Paper',
	scissors: '✂️ Scissors'
}

const playerScoreEl = document.getElementById('player-score')
const computerScoreEl = document.getElementById('computer-score')
const playerChoiceEl = document.getElementById('player-choice')
const computerChoiceEl = document.getElementById('computer-choice')
const roundStatusEl = document.getElementById('round-status')
const winMessageEl = document.getElementById('win-message')
const resetBtn = document.getElementById('reset-game')
const choiceButtons = Array.from(document.querySelectorAll('.choice-btn'))

const state = {
	playerScore: 0,
	computerScore: 0,
}

function getComputerChoice() {
	const randomIndex = Math.floor(Math.random() * choices.length)
	return choices[randomIndex]
}

function determineWinner(playerChoice, computerChoice) {
	if (playerChoice === computerChoice) return 'draw'
	return winningCombos[playerChoice] === computerChoice ? 'player' : 'computer'
}

function updateScore(winner) {
	if (winner === 'player') {
		state.playerScore += 1
	} else if (winner === 'computer') {
		state.computerScore += 1
	}

	playerScoreEl.textContent = state.playerScore
	computerScoreEl.textContent = state.computerScore
}

function highlightChoices(playerChoice, computerChoice, winner) {
	choiceButtons.forEach((button) => {
		const buttonChoice = button.dataset.choice
		button.classList.remove('active', 'winner', 'loser')

		if (buttonChoice === playerChoice) button.classList.add('active')

		if (buttonChoice === playerChoice || buttonChoice === computerChoice) {
			if (winner === 'draw') {
				button.classList.add('winner')
			} else if (winner === 'player' && buttonChoice === playerChoice) {
				button.classList.add('winner')
			} else if (winner === 'computer' && buttonChoice === computerChoice) {
				button.classList.add('winner')
			} else {
				button.classList.add('loser')
			}
		}
	})
}

function showRoundResult(playerChoice, computerChoice, winner) {
	playerChoiceEl.textContent = icons[playerChoice]
	computerChoiceEl.textContent = icons[computerChoice]

	roundStatusEl.className = 'status round-pop'

	if (winner === 'draw') {
		roundStatusEl.textContent = `Draw! Both chose ${icons[playerChoice].replace(/^.*\s/, '')}.`
		roundStatusEl.classList.add('draw')
	} else if (winner === 'player') {
		roundStatusEl.textContent = `You win! ${icons[playerChoice]} beats ${icons[computerChoice]}.`
		roundStatusEl.classList.add('win')
	} else {
		roundStatusEl.textContent = `Computer wins! ${icons[computerChoice]} beats ${icons[playerChoice]}.`
		roundStatusEl.classList.add('lose')
	}

	window.setTimeout(() => {
		roundStatusEl.classList.remove('round-pop')
	}, 280)
}

function playRound(playerChoice) {
	choiceButtons.forEach((button) => (button.disabled = true))
	choiceButtons.forEach((button) => button.classList.remove('active', 'winner', 'loser'))

	const computerChoice = getComputerChoice()
	const winner = determineWinner(playerChoice, computerChoice)

	highlightChoices(playerChoice, computerChoice, winner)
	showRoundResult(playerChoice, computerChoice, winner)
	updateScore(winner)

	choiceButtons.forEach((button) => (button.disabled = false))
}

function resetGame() {
	state.playerScore = 0
	state.computerScore = 0

	playerScoreEl.textContent = '0'
	computerScoreEl.textContent = '0'
	playerChoiceEl.textContent = '-'
	computerChoiceEl.textContent = '-'
	roundStatusEl.textContent = 'Make your move to begin.'
	roundStatusEl.className = 'status'
	winMessageEl.textContent = 'Play as many rounds as you want.'

	choiceButtons.forEach((button) => {
		button.classList.remove('active', 'winner', 'loser')
		button.disabled = false
	})
}

choiceButtons.forEach((button) => {
	button.addEventListener('click', () => playRound(button.dataset.choice))
})

resetBtn.addEventListener('click', resetGame)
