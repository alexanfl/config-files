-- ~/.config/nvim/colors/matcha.lua
-- Matcha-inspired Neovim colorscheme 🍵

local colors = {
  bg       = "#2C2F31",
  fg       = "#C8CCCD",
  comment  = "#555B62",

  red      = "#F07178",
  yellow   = "#E7C991",
  green    = "#8FBF8F",
  blue     = "#7ABDFF",
  magenta  = "#C080A1",
  cyan     = "#76C7B7",

  dark     = "#333638",
  accent   = "#3A3D3F",
}

vim.cmd("hi clear")
if vim.fn.exists("syntax_on") then
  vim.cmd("syntax reset")
end
vim.g.colors_name = "matcha"

local function hi(group, opts)
  local gui = opts.gui or "NONE"
  vim.cmd(string.format(
    "hi %s guifg=%s guibg=%s gui=%s",
    group,
    opts.fg or "NONE",
    opts.bg or "NONE",
    gui
  ))
end

-- UI
hi("Normal",       { fg=colors.fg, bg=colors.bg })
hi("LineNr",       { fg="#5B6065", bg=colors.bg })
hi("CursorLine",   { bg=colors.dark })
hi("CursorLineNr", { fg=colors.yellow, bg=colors.dark })
hi("StatusLine",   { fg=colors.fg, bg=colors.accent })
hi("StatusLineNC", { fg="#777777", bg=colors.bg })
hi("VertSplit",    { fg=colors.accent, bg=colors.accent })
hi("Visual",       { bg="#3E4446" })

-- Legacy syntax
hi("Comment",      { fg=colors.comment, gui="italic" })
hi("Constant",     { fg=colors.cyan })
hi("String",       { fg=colors.green })
hi("Character",    { fg=colors.green })
hi("Number",       { fg=colors.cyan })
hi("Boolean",      { fg=colors.cyan })
hi("Float",        { fg=colors.cyan })

hi("Identifier",   { fg=colors.blue })
hi("Function",     { fg=colors.magenta })

hi("Statement",    { fg=colors.red })
hi("Keyword",      { fg=colors.red })
hi("Conditional",  { fg=colors.red })
hi("Repeat",       { fg=colors.red })
hi("Operator",     { fg=colors.yellow })
hi("Exception",    { fg=colors.red })

hi("PreProc",      { fg=colors.yellow })
hi("Include",      { fg=colors.yellow })
hi("Define",       { fg=colors.yellow })
hi("Macro",        { fg=colors.yellow })

hi("Type",         { fg=colors.green })
hi("StorageClass", { fg=colors.green })
hi("Structure",    { fg=colors.green })
hi("Typedef",      { fg=colors.green })

hi("Special",      { fg=colors.blue })
hi("Underlined",   { fg=colors.blue, gui="underline" })
hi("Todo",         { fg=colors.yellow, bg="#444444", gui="bold" })

-- Treesitter mappings (modern highlight groups)
hi("@comment",        { fg=colors.comment, gui="italic" })
hi("@string",         { fg=colors.green })
hi("@number",         { fg=colors.cyan })
hi("@boolean",        { fg=colors.cyan })
hi("@function",       { fg=colors.magenta })
hi("@function.builtin",{ fg=colors.blue })
hi("@keyword",        { fg=colors.red })
hi("@conditional",    { fg=colors.red })
hi("@repeat",         { fg=colors.red })
hi("@operator",       { fg=colors.yellow })
hi("@variable",       { fg=colors.fg })
hi("@variable.builtin",{ fg=colors.yellow })
hi("@field",          { fg=colors.blue })
hi("@type",           { fg=colors.green })
hi("@type.builtin",   { fg=colors.green })
hi("@constant",       { fg=colors.cyan })
hi("@namespace",      { fg=colors.blue })
