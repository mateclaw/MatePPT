import {PPTDocument} from '@/ppt/core/entity/PPTDocument'
import {PPTMaster} from '@/ppt/core/entity/presentation/PPTMaster'
import {PPTLayout} from '@/ppt/core/entity/presentation/PPTLayout'
import {SlideSerializer} from './SlideSerializer'
import {ElementSerializer} from './ElementSerializer'

export class DocumentSerializer {
    static serialize(doc: PPTDocument): Record<string, any> {
        return {
            title: doc.title,
            width: doc.width,
            height: doc.height,
            theme: doc.theme,
            // masters: doc.masters.map(master => this.serializeMaster(master)),
            slides: doc.slides.map(slide => SlideSerializer.serialize(slide)),
        }
    }

    private static serializeMaster(master: PPTMaster) {
        return {
            id: master.id,
            name: master.name,
            background: master.background,
            elements: ElementSerializer.serializeList(master.elements),
            layouts: master.layouts.map(layout => this.serializeLayout(layout)),
        }
    }

    private static serializeLayout(layout: PPTLayout) {
        return {
            id: layout.id,
            name: layout.name,
            layoutType: layout.layoutType,
            background: layout.background,
            followMasterBackground: layout.followMasterBackground,
            hideMasterShapes: layout.hideMasterShapes,
            elements: ElementSerializer.serializeList(layout.elements),
        }
    }
}
