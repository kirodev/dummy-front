cd "D:\Dropbox\Family Room\Back-end\Data library\Licensee sales"

clear

import excel "smartphone shipments quarterly by company.xlsx", sheet("Sheet1") firstrow

replace TCLAlcatel = Alcatel if TCLAlcatel == .
drop Alcatel

gen qu = substr(Quarter, 2, 1)
destring qu, replace
destring Year, replace
gen yq = Year*10+qu
bysort Source Link : egen latestwiththislink = max(yq)
replace latestwiththislink = 0 if Link == ""

gsort yq Source  -latestwiththislink

foreach var of varlist Samsung - Honor Total {
replace `var'   = `var'[_n-1] if Source == Source[_n-1] & yq ==yq[_n-1] & `var'[_n-1] != .
}


replace Link = Link[_n-1] + "; " + Link if Source == Source[_n-1] & yq ==yq[_n-1]



bysort  yq Source : gen num = _n
bysort  yq Source : gen num1 = _N
keep if num == num1
drop num num1 latest yq qu 

*** cleaning up **
drop if Quarter == ""
drop BBK NokiaHMD

*** add zeros for exiting companies ***
count
set obs `=`r(N)'+9'
replace LG = 0 if Quarter == ""
replace Link = "https://www.wsj.com/articles/lg-calls-it-quits-on-smartphones-11617617789"  if Quarter == ""
replace Source = "Press" if Quarter == ""
bysort Quarter: gen num = _n
replace Year = 2021 if Quarter == "" & num ==1 
replace Year = 2022 if Quarter == "" & num >1 & num <6 
replace Year = 2023 if Quarter == "" & num >5 
replace Quarter = "Q4 2021" if Quarter == "" & num ==1 
bysort Year Quarter: gen num1 = _n
tostring num1, replace
tostring(Year), gen(Year1)
replace Quarter = "Q" + num1 + " " +Year1 if Quarter == ""
drop num num1 Year1

count
set obs `=`r(N)'+30'
replace MicrosoftMobile = 0 if Quarter == ""
replace Link = "https://www.smh.com.au/technology/smartphones-microsoft-exits-the-game-20160531-gp80lx.html"  if Quarter == ""
replace Source = "Press" if Quarter == ""
bysort Quarter: gen num = _n
replace Year = 2016 if Quarter == "" & num <3 
replace Year = 2017 if Quarter == "" & num >2 & num <7 
replace Year = 2018 if Quarter == "" & num >6 & num <11 
replace Year = 2019 if Quarter == "" & num >10 & num <15
replace Year = 2020 if Quarter == "" & num >14 & num <19
replace Year = 2021 if Quarter == "" & num >18 & num <23
replace Year = 2022 if Quarter == "" & num >22 & num <27
replace Year = 2023 if Quarter == "" & num >26 

replace Quarter = "Q3 2016" if Quarter == "" & num ==1 
replace Quarter = "Q4 2016" if Quarter == "" & num ==2 

bysort Year Quarter: gen num1 = _n
tostring num1, replace
tostring(Year), gen(Year1)
replace Quarter = "Q" + num1 + " " +Year1 if Quarter == ""
drop num num1 Year1


save "one estimate per source and quarter.dta", replace


bysort Year Quarter : gen num = _n


foreach var of varlist Samsung - Honor Total {
gen meanothers_`var' =  . 
gen dist_others_`var' = . 
gen obs_`var' = `var' != .
bysort Year Quarter : egen num_obs_`var' = total(obs_`var')
forvalues i = 1/4 {
gen `var'_1 = `var'
replace `var'_1 = . if num == `i'
bysort Year Quarter : egen meanothers_`var'_1  = mean(`var'_1)
gen dist_others_`var'_1 = `var' -  meanothers_`var'_1
replace dist_others_`var'_1 = -dist_others_`var'_1 if dist_others_`var'_1<0
replace meanothers_`var' = meanothers_`var'_1  if num == `i'
replace dist_others_`var' = dist_others_`var'_1  if num == `i'
drop `var'_1 meanothers_`var'_1   dist_others_`var'_1 
}
bysort Year Quarter : egen maxdist_`var' = max(dist_others_`var')
gen outlier_`var' = dist_others_`var' == maxdist_`var' & `var' != . & num_obs_`var'>2 & dist_others_`var' > 0.01
gen used_`var' = outlier_`var' == 0 & `var' != . 
drop meanothers_`var' dist_others_`var' num_obs_`var' obs_`var'
gen `var'_sources = ""
gen `var'_discarded = ""
replace `var'_sources = Source if used_`var' == 1
replace `var'_sources =  `var'_sources+"; "+ `var'_sources[_n-1] if Quarter == Quarter[_n-1]
replace  `var'_sources = subinstr(`var'_sources , "; ; ", "; ", .)
replace `var'_sources = substr(`var'_sources, 3, 1000) if substr(`var'_sources, 1, 2)== "; "
replace `var'_sources = substr(`var'_sources, 1, strlen(`var'_sources)-2) if substr(`var'_sources, strlen(`var'_sources)-1, 2)== "; "
replace `var'_sources = substr(`var'_sources, 1, strlen(`var'_sources)-2) if substr(`var'_sources, strlen(`var'_sources)-1, 2) =="; "

replace `var'_discarded = Source if outlier_`var' == 1
replace `var'_discarded = `var'_discarded[_n-1] if `var'_discarded[_n-1]  != "" & Quarter == Quarter[_n-1]
}

foreach var of varlist Samsung - Honor Total {
gen `var'_1 = `var'
replace `var'_1 = . if used_`var' == 0
bysort Year Quarter: egen mean_`var'_1 = mean(`var'_1)
replace `var' = round(mean_`var'_1, 0.1)
}
drop *_1


bysort Year Quarter : gen num1 = _N
keep if num == num1
drop num num1

drop Source Link maxdist_* outlier_* used_* 
drop if Quarter == ""
save "one estimate per quarter.dta", replace
