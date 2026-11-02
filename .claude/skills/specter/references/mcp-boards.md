# Configuración de MCP para tableros (Jira y Azure DevOps)

Specter guarda el desglose en **Markdown por defecto**, pero pregunta **siempre** al usuario si
tiene un tablero de Jira o Azure DevOps. Si elige uno, configura el MCP pidiendo **solo las
credenciales de conexión**; nunca muestres ni persistas secretos en el repositorio.

## Protocolo de credenciales

1. Pide **solo** lo mínimo para conectar el tablero indicado.
2. No imprimas los valores en pantalla ni los guardes en archivos del proyecto.
3. Usa variables de entorno referenciadas como `${...}` en la configuración del MCP; indícale al
   usuario dónde definirlas (archivo de entorno del cliente o sesión).
4. Si el cliente no soporta la variable de entorno en ese formato, pide al usuario que la rellene
   él mismo; no copies el secreto a la configuración.
5. Un MCP recién agregado requiere **recargar/reiniciar el cliente** antes de exponer sus
   herramientas. Si no aparecen, informa al usuario y cae a Markdown sin bloquear.

## Jira (mcp-atlassian)

Credenciales a pedir:

| Variable | Qué es |
|---|---|
| `JIRA_URL` | URL base, p. ej. `https://<empresa>.atlassian.net` |
| `JIRA_USERNAME` | Correo de la cuenta de Atlassian |
| `JIRA_API_TOKEN` | Token de API generado en Atlassian |

Claude Code (`.claude/settings.json` o `~/.claude.json`, bloque `mcpServers`):

```json
{
  "mcpServers": {
    "jira": {
      "command": "uvx",
      "args": ["mcp-atlassian"],
      "env": {
        "JIRA_URL": "${JIRA_URL}",
        "JIRA_USERNAME": "${JIRA_USERNAME}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
      }
    }
  }
}
```

VS Code (`.vscode/mcp.json`):

```json
{
  "servers": {
    "jira": {
      "type": "stdio",
      "command": "uvx",
      "args": ["mcp-atlassian"]
    }
  }
}
```

## Azure DevOps (@azure-devops/mcp)

Credenciales a pedir:

| Dato | Qué es |
|---|---|
| Organización | `https://dev.azure.com/<organización>` (se pasa como argumento) |
| PAT | Token personal con permisos de Work Items (se pasa por entorno) |

Claude Code (bloque `mcpServers`):

```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "<organización>", "-d", "core", "work", "work-items", "test-plans", "--authentication", "pat"],
      "env": { "PERSONAL_ACCESS_TOKEN": "${PERSONAL_ACCESS_TOKEN}" }
    }
  }
}
```

VS Code (`.vscode/mcp.json`):

```json
{
  "servers": {
    "azure-devops": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "<organización>", "-d", "core", "work", "work-items", "test-plans"]
    }
  }
}
```

## Después de conectar

- Jira: antes de crear issues, confirma proyecto, tipo de issue (Story/Task/Sub-task), assignee y
  el vínculo a la épica. Orden: TT de infraestructura/setup → HU por prioridad → subtareas.
- Azure DevOps: antes de crear work items, confirma proyecto/team, tipo (Story/Task), área,
  iteración y el vínculo al parent (épica/feature).
- Reporta al usuario los enlaces de cada issue/work item creado.
