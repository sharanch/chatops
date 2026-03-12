{{/*
Expand the name of the chart.
*/}}
{{- define "chatops.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "chatops.fullname" -}}
{{- printf "%s" .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels applied to every resource.
*/}}
{{- define "chatops.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "chatops.frontend.labels" -}}
{{ include "chatops.labels" . }}
app.kubernetes.io/name: chatops-frontend
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "chatops.frontend.selectorLabels" -}}
app.kubernetes.io/name: chatops-frontend
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "chatops.backend.labels" -}}
{{ include "chatops.labels" . }}
app.kubernetes.io/name: chatops-backend
app.kubernetes.io/component: backend
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "chatops.backend.selectorLabels" -}}
app.kubernetes.io/name: chatops-backend
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Postgres labels
*/}}
{{- define "chatops.postgres.labels" -}}
{{ include "chatops.labels" . }}
app.kubernetes.io/name: chatops-postgres
app.kubernetes.io/component: database
{{- end }}

{{/*
Postgres selector labels
*/}}
{{- define "chatops.postgres.selectorLabels" -}}
app.kubernetes.io/name: chatops-postgres
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Redis labels
*/}}
{{- define "chatops.redis.labels" -}}
{{ include "chatops.labels" . }}
app.kubernetes.io/name: chatops-redis
app.kubernetes.io/component: cache
{{- end }}

{{/*
Redis selector labels
*/}}
{{- define "chatops.redis.selectorLabels" -}}
app.kubernetes.io/name: chatops-redis
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
