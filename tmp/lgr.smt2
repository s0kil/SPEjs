(declare-const freeExports undefined)
(declare-const freeModule undefined)
(assert (and freeExports  freeModule ))
(check-sat)
(get-value (freeExports freeModule))