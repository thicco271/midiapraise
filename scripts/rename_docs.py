#!/usr/bin/env python3
"""Atualiza nomes em arquivos .md e .ts do projeto.
Substitui:
  - 'PraiseHub' → 'ADSA Reimberg Mídias'
  - 'ADSA Praise' → 'ADSA Reimberg' (mas NÃO em admin@adsapraise.org)
  - 'praisehub2026' (senha) → mantida
  - 'admin@adsapraise.org' (email) → mantido
  - 'PRAISEHUB_SESSION_SECRET' / 'PRAISEHUB_ADMIN_PASSWORD' (env vars) → mantidas
"""
import os
import re
import sys

BASE = "/home/z/my-project"

# Extensões para processar
EXTS = {".md"}

# Arquivos/padrões a NÃO tocar (preservar)
SKIP_PATHS = {
    "scripts/spec_full.md",           # spec original do PDF
    "scripts/parse_spec.py",
    "tool-results/",                  # outputs antigos
    "skills/",                        # skills do sistema
    "node_modules/",
    ".next/",
    ".git/",
}

# Padrões de substituição (ordem importa!)
# Primeiro protejo o email e variáveis de ambiente com placeholder,
# depois faço a troca, depois restauro.
PROTECT = [
    (r"admin@adsapraise\.org", "<<EMAIL_ADMIN>>"),
    (r"adsapraise\.org", "<<DOMAIN_ADSAPRAISE>>"),
    (r"PRAISEHUB_SESSION_SECRET", "<<ENV_SESSION_SECRET>>"),
    (r"PRAISEHUB_ADMIN_PASSWORD", "<<ENV_ADMIN_PASSWORD>>"),
    (r"praisehub2026", "<<SENHA_PADRAO>>"),
    (r"praisehub_session", "<<COOKIE_SESSION>>"),  # nome do cookie
]

RESTORE = [
    ("<<EMAIL_ADMIN>>", "admin@adsapraise.org"),
    ("<<DOMAIN_ADSAPRAISE>>", "adsapraise.org"),
    ("<<ENV_SESSION_SECRET>>", "PRAISEHUB_SESSION_SECRET"),
    ("<<ENV_ADMIN_PASSWORD>>", "PRAISEHUB_ADMIN_PASSWORD"),
    ("<<SENHA_PADRAO>>", "praisehub2026"),
    ("<<COOKIE_SESSION>>", "praisehub_session"),
]

SUBSTITUTIONS = [
    ("PraiseHub", "ADSA Reimberg Mídias"),
    ("ADSA Praise", "ADSA Reimberg"),
]


def should_skip(path: str) -> bool:
    rel = os.path.relpath(path, BASE)
    for s in SKIP_PATHS:
        if rel.startswith(s) or s in rel:
            return True
    return False


def transform(content: str) -> str:
    # 1. Proteger
    for pat, repl in PROTECT:
        content = re.sub(pat, repl, content)
    # 2. Substituir
    for old, new in SUBSTITUTIONS:
        content = content.replace(old, new)
    # 3. Restaurar
    for ph, original in RESTORE:
        content = content.replace(ph, original)
    return content


def main():
    changed = 0
    visited = 0
    for root, dirs, files in os.walk(BASE):
        # poda de dirs
        dirs[:] = [d for d in dirs if not should_skip(os.path.join(root, d))]
        for f in files:
            full = os.path.join(root, f)
            if should_skip(full):
                continue
            ext = os.path.splitext(f)[1]
            if ext not in EXTS:
                continue
            try:
                with open(full, "r", encoding="utf-8") as fh:
                    original = fh.read()
            except Exception as e:
                print(f"skip (read error): {full}: {e}")
                continue
            novo = transform(original)
            visited += 1
            if novo != original:
                with open(full, "w", encoding="utf-8") as fh:
                    fh.write(novo)
                changed += 1
                print(f"updated: {os.path.relpath(full, BASE)}")
    print(f"\n{changed}/{visited} arquivos atualizados.")


if __name__ == "__main__":
    main()
