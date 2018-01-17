" My VIMRC starts here:
set nocompatible
filetype off

" Pathogen
execute pathogen#infect()
call pathogen#helptags() " generate helptags for everything in 'runtimepath'

syntax enable
filetype plugin indent on

" Set number of colors
set t_Co=256

" Set colorscheme muon:
" colorscheme muon

" Set colorscheme gruvbox (dark version)
colorscheme gruvbox
set background=dark

" Line numbering
set nu

" Line color highlight
hi CursorLine cterm=NONE ctermbg=233 ctermfg=NONE guibg=NONE guifg=NONE
hi CursorLineNr cterm=NONE ctermbg=NONE ctermfg=252 guibg=NONE guifg=NONE
hi LineNr cterm=NONE ctermbg=233 ctermfg=242 guibg=NONE guifg=NONE
hi Comment ctermfg=239
set cursorline


" Latex-suite
let g:Tex_DefaultTargetFormat = 'pdf'
let g:Tex_MultipleCompileFormats = 'dvi,pdf'

" let g:Tex_CompileRule_dvi = 'latex --interaction=nonstopemode $*'
" let g:Tex_CompileRule_ps = 'dvips -Ppdf -o $*.ps $*.dvi'
" let g:Tex_CompileRule_pdf = 'ps2pdf $*.ps'
" let g:Tex_FormatDepency_pdf = 'dvi,ps,pdf'



" NERDtree
nnoremap <F2> :NERDTreeToggle<CR>
" Tagbar
nnoremap <F3> :TagbarToggle<CR>
" Rainbow parenthesis
au VimEnter * RainbowParenthesesToggle
au Syntax * RainbowParenthesesLoadRound
au Syntax * RainbowParenthesesLoadSquare
au Syntax * RainbowParenthesesLoadBraces

nnoremap <silent> <buffer> <cr> :CSearchContext<cr>

" Show note at char 80 and up
" let &colorcolumn=join(range(81,999),",")
" highlight ColorColumn ctermbg=235 guibg=#2c2d27
" hi Normal guibg=#32322f ctermbg=236
" hi NonText guibg=#32322f ctermbg=236
hi ColorColumn guibg=#2a2d27 ctermbg=0
let &colorcolumn="79,".join(range(120,999),",")

" set tab configuration
set smartindent
set tabstop=4
set shiftwidth=4
set expandtab

" making closing characters
inoremap {      {}<Left>
inoremap {<CR>  {<CR>}<Esc>O
inoremap {{     {
inoremap {}     {}


inoremap        (  ()<Left>
inoremap <expr> )  strpart(getline('.'), col('.')-1, 1) == ")" ? "\<Right>" : ")"

inoremap        {  {}<Left>
inoremap <expr> }  strpart(getline('.'), col('.')-1, 1) == "}" ? "\<Right>" : "}"

inoremap        [  []<Left>
inoremap <expr> ]  strpart(getline('.'), col('.')-1, 1) == "]" ? "\<Right>" : "]"

inoremap 	"      ""<Left>
inoremap <expr> " strpart(getline('.'), col('.')-1, 1) == "\"" ? "\<Right>" : "\"\"\<Left>"

inoremap 	'      ''<Left>
inoremap <expr> ' strpart(getline('.'), col('.')-1, 1) == "\'" ? "\<Right>" : "\'\'\<Left>"

cnoreabbrev <expr> W ((getcmdtype() is# ':' && getcmdline() is# 'W')?('w'):('W'))
cnoreabbrev <expr> Q ((getcmdtype() is# ':' && getcmdline() is# 'Q')?('q'):('Q'))
noreabbrev <expr> Wq ((getcmdtype() is# ':' && getcmdline() is# 'Wq')?('wq'):('Wq'))
noreabbrev <expr> WQ ((getcmdtype() is# ':' && getcmdline() is# 'WQ')?('wq'):('WQ'))
