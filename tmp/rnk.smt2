(declare-const z undefined)
(assert (and (< z  180 ) (> z  80 )))
(check-sat)
(get-value (z))