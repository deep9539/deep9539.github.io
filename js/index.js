let yearAndMonth = '1984/12';
let plotType = 'SeasonallyAdjusted';

function updateIntro(yearAndMonth) {
	if (yearAndMonth == '2023/12') {
		document.getElementById("recession_name").innerHTML = "2020 coronavirus recession";
		document.getElementById("reason").innerHTML = "The COVID-19 recession, also known as the Great Lockdown, was a global economic recession caused by the COVID-19 pandemic. The recession began in most countries in February 2020. After a year of global economic slowdown that saw stagnation of economic growth and consumer activity, the COVID-19 lockdowns and other precautions taken in early 2020 drove the global economy into crisis. Within seven months, every advanced economy had fallen to recession.";
	}
	if (yearAndMonth == '2012/12') {
		document.getElementById("recession_name").innerHTML = "Global financial crisis";
		document.getElementById("reason").innerHTML = "The 2007–2008 financial crisis, or the global financial crisis (GFC), was the most severe worldwide economic crisis since the Great Depression. Predatory lending in the form of subprime mortgages targeting low-income homebuyers, excessive risk-taking by global financial institutions, a continuous buildup of toxic assets within banks, and the bursting of the United States housing bubble culminated in a \"perfect storm\", which led to the Great Recession.";
	}
	if (yearAndMonth == '1994/12') {
		document.getElementById("recession_name").innerHTML = "Early 1990s recession";
		document.getElementById("reason").innerHTML = "The United States entered a recession in 1990, which lasted 8 months through March 1991. Although the recession was mild relative to other post-war recessions, it was characterized by a sluggish employment recovery, most commonly referred to as a jobless recovery. Unemployment continued to rise through June 1992, even though a positive economic growth rate had returned the previous year.";
	}
	if (yearAndMonth == '1984/12') {
		document.getElementById("recession_name").innerHTML = "1980's Double dip recession";
		document.getElementById("reason").innerHTML = "Principal causes of the 1980 recession included contractionary monetary policy undertaken by the Federal Reserve to combat double digit inflation and residual effects of the energy crisis. Manufacturing and construction failed to recover before more aggressive inflation reducing policy was adopted by the Federal Reserve in 1981, causing a second downturn. Due to their proximity and compounded effects, they are commonly referred to as the early 1980s recession, an example of a W-shaped or \"double dip\" recession; it remains the most recent example of such a recession in the United States.";	
	}
}

function selectButton(selectedButton, yearDate) {
    // Get all buttons in the container
    const buttons = document.querySelectorAll('.button-container button');
    
    // Remove 'selected' class from all buttons
    buttons.forEach(button => button.classList.remove('selected'));
    
    // Add 'selected' class to the clicked button
    selectedButton.classList.add('selected');
    yearAndMonth = yearDate
    updateIntro(yearAndMonth);
    updateUnemploymentGraph(yearAndMonth, plotType);
    updatePrevNextButton();
}

function prevRecessionYear() {
	if (yearAndMonth == '1994/12') {
		return '1984/12'
	}
	else if (yearAndMonth == '2012/12') {
		return '1994/12'
	}
	else if (yearAndMonth == '2023/12') {
		return '2012/12'
	}
	return null;
}

function nextRecessionYear() {
	if (yearAndMonth == '1984/12') {
		return '1994/12'
	}
	else if (yearAndMonth == '1994/12') {
		return '2012/12'
	}
	else if (yearAndMonth == '2012/12') {
		return '2023/12'
	}
	return null;
}

function updatePrevNextButton() {
	document.getElementById('nextYearButton').disabled = (nextRecessionYear(yearAndMonth) == null);
	document.getElementById('prevYearButton').disabled = (prevRecessionYear(yearAndMonth) == null);
}

function updateButton() {
	const buttons = document.querySelectorAll('.button-container button');
	// Remove 'selected' class from all buttons
    buttons.forEach(button => button.classList.remove('selected'));
	document.getElementById(yearAndMonth).classList.add('selected');
}

function updatePlotType(selectedButton, newPlotType) {
	// Get all buttons in the container
    const buttons = document.querySelectorAll('.plotbutton-container button');
    
    // Remove 'selected' class from all buttons
    buttons.forEach(button => button.classList.remove('selected'));
    
    // Add 'selected' class to the clicked button
    selectedButton.classList.add('selected');
	plotType = newPlotType;
	updateUnemploymentGraph(yearAndMonth, plotType);
}

function nextrecession() {
	var next_year = nextRecessionYear(yearAndMonth);
	yearAndMonth = next_year;
	updateIntro(yearAndMonth);
	updateUnemploymentGraph(yearAndMonth, plotType);
	updatePrevNextButton();
	updateButton();
}

function prevrecession() {
	var prev_year = prevRecessionYear(yearAndMonth);
	yearAndMonth = prev_year;
	updateIntro(yearAndMonth);
	updateUnemploymentGraph(yearAndMonth, plotType);
	updatePrevNextButton();
	updateButton()
}