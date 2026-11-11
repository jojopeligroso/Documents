# Irish public holidays: Holiday List seed data (rest of 2026, and 2027)

Machine-readable copy: [`data/holidays-ie.csv`](../data/holidays-ie.csv). It gets
imported into each Site Sheet's Settings ▸ Holiday List.

## ⚠️ Verification status: NOT yet checked against an official source

The official sites (citizensinformation.ie, workplacerelations.ie) could not be
reached from the session that produced this file. The dates were **calculated**
from the statutory rules below, as recalled from training (Organisation of Working
Time Act 1997, Schedule 2, as amended to add St Brigid's Day from 2023). The 2027
dates for 1 Jan, 1 Feb, 17 Mar, 29 Mar and 25 Oct match secondary sites found by
web search (e.g. leavebalance.com, holidaydb.com), but those are not authoritative.

**Before go-live:** check each date against
<https://www.citizensinformation.ie/en/employment/employment-rights-and-conditions/leave-and-holidays/public-holidays/>
and set `verified` to `yes` in the CSV.

## Rules used

| Holiday | Rule |
|---|---|
| New Year's Day | 1 January |
| St Brigid's Day | First Monday in February, or 1 February if that is a Friday |
| St Patrick's Day | 17 March |
| Easter Monday | Day after Easter Sunday (Gregorian computus) |
| May / June / August | First Monday of the month |
| October | **Last** Monday of October |
| Christmas Day | 25 December |
| St Stephen's Day | 26 December |

Good Friday is **not** a public holiday in Ireland.

## Dates

### 2026 (remaining after 11 Nov 2026)
| Date | Day | Holiday |
|---|---|---|
| 2026-12-25 | Fri | Christmas Day |
| 2026-12-26 | Sat | St Stephen's Day (falls on a weekend) |

### 2027
| Date | Day | Holiday |
|---|---|---|
| 2027-01-01 | Fri | New Year's Day |
| 2027-02-01 | Mon | St Brigid's Day |
| 2027-03-17 | Wed | St Patrick's Day |
| 2027-03-29 | Mon | Easter Monday |
| 2027-05-03 | Mon | May Bank Holiday |
| 2027-06-07 | Mon | June Bank Holiday |
| 2027-08-02 | Mon | August Bank Holiday |
| 2027-10-25 | Mon | October Bank Holiday |
| 2027-12-25 | Sat | Christmas Day (falls on a weekend) |
| 2027-12-26 | Sun | St Stephen's Day (falls on a weekend) |

## Weekend clashes: needs a site decision

As I understand Irish law (from training, unverified), a public holiday that falls
on a weekend does **not** automatically move to the Monday. Employees instead get
an entitlement (e.g. a paid day off within a month, an extra day of annual leave,
or an extra day's pay), and the employer chooses which. So whether the site is
**closed** on Mon 28 Dec 2026, or on Mon 27 and Tue 28 Dec 2027, is a site decision.
If it is, add those days to the Holiday List as `site_closure`.
