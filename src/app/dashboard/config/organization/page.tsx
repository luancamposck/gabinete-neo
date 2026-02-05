import { notFound, redirect } from "next/navigation"

import { getOrganizationAdminSettingsAction } from "@/modules/organizations/server/slices/get-organization-admin-settings/actions/get-organization-admin-settings.action"
import { EditOrganizationFieldForm } from "@/modules/organizations/ui/edit-organization-field-form"
import { EditOrganizationImageForm } from "@/modules/organizations/ui/edit-organization-image-form"
import { LinkSharePreview } from "@/modules/organizations/ui/link-share-preview"
import { OrganizationConfigProvider } from "@/modules/organizations/ui/organization-config.context"
import { getRequestHost } from "@/shared/http/get-request-host"

const OrganizationConfigPage = async () => {
	const getOrgRes = await getOrganizationAdminSettingsAction()

	if (getOrgRes.success === false) {
		switch (getOrgRes.code) {
			case "unauthenticated": {
				return redirect("/")
			}

			case "org_not_found": {
				return redirect("/tenant-not-found")
			}

			case "not_allowed": {
				return notFound()
			}

			default: {
				throw new Error(getOrgRes.message)
			}
		}
	}

	const { organization } = getOrgRes.data

	const isDevEnviroment = process.env.NODE_ENV === "development"
	const host = await getRequestHost()
	const exampleLink = isDevEnviroment ? "http://localhost:3000" : `https://${host ?? organization.appDomain}`

	return (
		<OrganizationConfigProvider initialName={organization.name} initialDescription={organization.description} initialImageUrl={organization.imageUrl}>
			<div className="p-4 space-y-6">
				<header className="flex flex-col md:flex-row gap-3 items-center md:justify-between">
					<div className="space-y-1 flex-col">
						<h1 className="text-2xl font-semibold tracking-tight">Configurações da organização</h1>
						<p className="text-sm text-muted-foreground">Ajuste as informações principais que identificam sua organização no dashboard.</p>
					</div>
				</header>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
					<div className="space-y-6">
						<EditOrganizationFieldForm organization={organization} />
						<EditOrganizationImageForm defaultImageUrl={organization.imageUrl} />
					</div>

					<section className="space-y-4">
						<LinkSharePreview exampleLink={exampleLink} />

						<div className="rounded-lg border bg-card p-4 shadow-sm">
							<div className="text-sm font-semibold">Onde essas informações aparecem</div>
							<p className="mt-2 text-xs text-muted-foreground">O título e a descrição são mostrados em pontos-chave da plataforma, como topo do dashboard, páginas internas e áreas de compartilhamento.</p>
							<div className="mt-4 rounded-md border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
								Quando os campos estiverem ativos, essas informações serão refletidas automaticamente em títulos e descrições exibidos pela plataforma.
							</div>
						</div>
					</section>
				</div>
			</div>
		</OrganizationConfigProvider>
	)
}

export default OrganizationConfigPage
