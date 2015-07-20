@echo off

GOTO CASE_%1

:CASE_-rebase
    set branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')
    git checkout dev-test
    git pull origin dev-test
    git checkout %branch%
    git rebase dev-test
    GOTO END_SWITCH

:CASE_-rebasefrom
    set branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')
    git checkout %2
    git pull origin %2
    git checkout %branch%
    git rebase %2
    GOTO END_SWITCH

:CASE_-rebasefromto
    git checkout %2
    git pull origin %2
    git checkout %3%
    git rebase %2
    GOTO END_SWITCH

:CASE_-create
    git checkout dev-test
    git pull origin dev-test
    git checkout -b %2%
    GOTO END_SWITCH

:CASE_-commitall
    set branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')
    git add -A
    git commit -m %2
    git push origin %branch%
    GOTO END_SWITCH

:END_SWITCH