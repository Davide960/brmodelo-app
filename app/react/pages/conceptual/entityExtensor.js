export default class EntityExtensor {

    constructor(shapeFactory, shapeValidator, linker) {
        this.factory = shapeFactory;
        this.validator = shapeValidator;
        this.linker = linker;
    }

    createExtension = (parentEntity, extentionType) => {
        const x = parentEntity.model.attributes.position.x;
        const y = parentEntity.model.attributes.position.y;
        const isa = this.factory.createIsa();

        let level = 1;
        const previousExtension = this.entityHasExtension(parentEntity);
        if(previousExtension != null) {
            level = previousExtension.level + 1;
        }

        isa.attributes.level = level;
        const extendedEntity = this.factory.createEntity();

        isa.attributes.position.x = x + 18;
        isa.attributes.position.y = y + 60;
        
        // Traduttore grafico locale applicato al momento della creazione
        var extVal = extentionType;
        if (extVal === '(t, d)' || extVal === '(t,d)' || extVal === 'td') extVal = 't.e.';
        if (extVal === '(p, d)' || extVal === '(p,d)' || extVal === 'pd') extVal = 'p.e.';
        if (extVal === '(t, c)' || extVal === '(t,c)' || extVal === 'tc') extVal = 't.o.';
        if (extVal === '(p, c)' || extVal === '(p,c)' || extVal === 'pc') extVal = 'p.o.';
        isa.attributes.attrs.text.text = extVal;

        extendedEntity.attributes.position.x = x;
        extendedEntity.attributes.position.y = y + 120;

        const graph = parentEntity.model.graph;
        const paper = parentEntity.paper;

        paper?.freeze();
        try {
            graph.addCell(isa);
            graph.addCell(extendedEntity);

            this.linker.createLink(isa, parentEntity.model, graph);

            parentEntity.model.attributes.isExtended = true;
            isa.attributes.parentId = parentEntity.model.attributes.id;

            this.linker.createLink(isa, extendedEntity, graph);
        } finally {
            paper?.unfreeze();
        }
    };

    entityHasExtension = (entity) => {
        const neighbors = entity.model.graph.getNeighbors(entity.model);
        const extension = neighbors.find(element => {
            return this.validator.isExtension(element);
        }); 
        if(extension != null) {     
            return {
                id: extension.id,
                level: extension.attributes.level
            };
        }
        return null;
    };

    updateExtension = (entity, extentionType) => {
        const graph = entity.model.graph;
        const paper = entity.paper;

        const neighbors = graph.getNeighbors(entity.model);
        const extension = neighbors.find(element => {
            return this.validator.isExtension(element) && element.attributes.parentId == entity.model.attributes.id;
        });

        if(extension != null) {
            // Traduttore grafico locale applicato durante l'aggiornamento
            var updateVal = extentionType;
            if (updateVal === '(t, d)' || updateVal === '(t,d)' || updateVal === 'td') updateVal = 't.e.';
            if (updateVal === '(p, d)' || updateVal === '(p,d)' || updateVal === 'pd') updateVal = 'p.e.';
            if (updateVal === '(t, c)' || updateVal === '(t,c)' || updateVal === 'tc') updateVal = 't.o.';
            if (updateVal === '(p, c)' || updateVal === '(p,c)' || updateVal === 'pc') updateVal = 'p.o.';
            extension.attributes.attrs.text.text = updateVal;
            
            const extensionView = extension.findView(paper);
            extensionView.update();
        }

        return extension;
    }

}
