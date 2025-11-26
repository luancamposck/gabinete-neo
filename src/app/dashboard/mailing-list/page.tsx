import { Briefcase } from "lucide-react"
import { MailingListTable } from "@/components/data-tables/mailing-list/mailing-list-table"
import { MailingListModal } from "@/components/modals/mailing-list-modal"

const MailingListPage = () => (
	<>
		<div>
			<h1 className="text-3xl font-semibold mb-4 flex items-center gap-2">
				<Briefcase className="size-7" /> Mala Direta
			</h1>
			<div className="flex justify-between">
				<p>Adicione contatos, gerencie endereços e não esqueça nenhum número, tudo isso aqui.</p>

				<MailingListModal />
			</div>
		</div>
		<div className="flex flex-1 flex-col gap-4">
			<div className="grid auto-rows-min gap-4 md:grid-cols-3">
				<div className="bg-muted/50 aspect-video rounded-xl" />
				<div className="bg-muted/50 aspect-video rounded-xl" />
				<div className="bg-muted/50 aspect-video rounded-xl" />
			</div>
		</div>
		{/* <div className="bg-muted/50 min-h-[100vh] w-screen flex-1 rounded-xl md:min-h-min"></div> */}
		<MailingListTable />
	</>
)

export default MailingListPage
