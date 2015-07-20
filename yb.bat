@echo off
set master = dev-test

GOTO CASE_%1

:CASE_-rebase
    set branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')
    git checkout %master%
    git pull origin %master%
    git checkout %branch%
    git rebase %master%
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
    git checkout %master%
    git pull origin %master%
    git checkout -b %2%
    GOTO END_SWITCH

:CASE_-commitall
    set branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')
    git add -A
    git commit -m %2
    git push origin %branch%
    GOTO END_SWITCH

:END_SWITCH