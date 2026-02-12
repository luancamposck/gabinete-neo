// @/modules/emails/shared/templates/welcome-email.template.tsx

import type { CSSProperties } from "react"

type WelcomeEmailTemplateProps = {
	greeting: string
	title: string
	dashboardUrl?: string
}

const APP_NAME = "Gabinete Neo"

const bodyStyle: CSSProperties = {
	margin: "0",
	padding: "24px",
	backgroundColor: "#f4f6f8",
	fontFamily: "Arial, Helvetica, sans-serif",
	color: "#111827"
}

const cardStyle: CSSProperties = {
	maxWidth: "560px",
	width: "100%",
	backgroundColor: "#ffffff",
	border: "1px solid #e5e7eb",
	borderRadius: "12px",
	padding: "28px"
}

const buttonStyle: CSSProperties = {
	display: "inline-block",
	padding: "12px 18px",
	borderRadius: "8px",
	textDecoration: "none",
	backgroundColor: "#0f172a",
	color: "#ffffff",
	fontWeight: 600
}

export const WelcomeEmailTemplate = ({ greeting, title, dashboardUrl }: WelcomeEmailTemplateProps) => {
	return (
		<div style={bodyStyle}>
			<table role="presentation" style={{ width: "100%", borderCollapse: "collapse" }}>
				<tbody>
					<tr>
						<td align="center">
							<table role="presentation" style={cardStyle}>
								<tbody>
									<tr>
										<td>
											<p style={{ margin: "0 0 16px", fontSize: "16px", lineHeight: 1.5 }}>{greeting}</p>
											<h1 style={{ margin: "0 0 12px", fontSize: "24px", lineHeight: 1.2, color: "#0f172a" }}>{title}</h1>
											<p style={{ margin: "0 0 16px", fontSize: "15px", lineHeight: 1.6, color: "#334155" }}>Sua conta foi criada com sucesso. Que bom ter você por aqui.</p>
											{dashboardUrl ? (
												<p style={{ margin: "0 0 24px" }}>
													<a href={dashboardUrl} style={buttonStyle}>
														Acessar dashboard
													</a>
												</p>
											) : null}
											<p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "#64748b" }}>Equipe {APP_NAME}</p>
										</td>
									</tr>
								</tbody>
							</table>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}
