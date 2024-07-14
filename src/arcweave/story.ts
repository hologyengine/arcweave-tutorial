import { Interpreter } from '@arcweave/arcscript'
import { ArcweaveProject, Branch, Condition, Connection, Element, VariableItem } from './types';

type ResolvedConnection = Connection &{
  runtimeLabel: string
}

export type AttributeFilter = {
  name: string
  value?: string
  predicate?: (value: string) => boolean
}
export type ElementQuery = {
  attribute?: AttributeFilter[]
  componentId?: string
}
export type ComponentQuery = {
  attribute?: AttributeFilter[]
}

export class StoryPath {
  label?: string
  readonly connections: ResolvedConnection[] = []
  targetElementId?: string
}

export class ArcweaveStory<P extends ArcweaveProject> {
  private varValues!: {[id: string]: VariableItem['value']}
  private varObjects!: {[id: string]: VariableItem}
  private readonly elementVisits = {}
  private currentElement: string|null
  private interpreter!: Interpreter

  constructor(private projectData: P) {
     this.varObjects = Object.fromEntries(Object.entries(projectData.variables)
      .filter(([, variable]) => 'name' in variable)
      .map(([id, variable]) => {
        if ('name' in variable) {
          return [id, {id, ...variable}]
        } else {
          return []
        }
      }))
     this.resetVariables()
     this.resetVisits()
     this.interpreter = new Interpreter(this.varValues, this.varObjects, this.elementVisits, this.currentElement)
  }

  private resetVariables() {
    if (this.varValues == null) {
      this.varValues = {}
    }
    Object.assign(this.varValues, Object.fromEntries(Object.entries(this.projectData.variables)
      .filter(([, variable]) => 'name' in variable)
      .map(([id, variable]) => {
        if ('name' in variable) {
          return [id, variable.value]
        } else {
          return []
        }
      })))
  }

  private resetVisits() {
    Object.keys(this.projectData.elements).forEach(elementId => {
      this.elementVisits[elementId] = 0
    })
  }

  getCurrentElement(): Element|undefined {
    return this.currentElement != null && this.currentElement != '' 
      ? this.projectData.elements[this.currentElement]
      : undefined
  }

  getCurrentRuntimeContent(): string|undefined {
    return this.getCurrentElement()?.content
  }

  setCurrentElement(elementId: string) {
    this.currentElement = elementId
    const element = this.getCurrentElement()
    if (element != null && element.content != null && element.content != '') {
      this.interpreter.runScript(element.content, this.varValues)
    }
  }

  getVariables() {
    return Object.fromEntries(Object.entries(this.projectData.variables).map(([,v]) => {
      if ('name' in v) {
          return [v.name, v.value]
      } else {
          return []
      }
    })) as {
      [i in keyof P['variables'] as P['variables'][i] extends VariableItem ? P['variables'][i]['name'] : never]: 
        P['variables'][i] extends  VariableItem ? P['variables'][i]['value'] : never
    } 
  }

  setVariables(variables: {[name: string]: VariableItem['value']}) {
    for (const [name, value] of Object.entries(variables)) {
      this.setVariable(name, value)
    }
  }

  setVariable(name: string, value: VariableItem['value']) {
    for (const [id, variable] of Object.entries(this.varObjects)) {
      if (variable.name === name) {
        this.varValues[id] = value
        break
      }
    }
  }

  /**
   * Find an element id based on attributes and/or a component id
   * 
   * const wandaId = this.findComponentId({attribute: [{name: 'obj_id', value: 'Wanda'}]})
   * const elementId = this.findElementId({attribute: [{name: 'tag', value: 'dialogue_start'}], componentId: wandaId})
   * @param query 
   * @returns 
   */

  findElementId(query: ElementQuery): string|undefined {
    const attributes = Object.values(this.projectData.attributes)
    return Object.keys(this.projectData.elements).find(eId => {
      const byAttributes = query.attribute?.every(attrFilter => {
        const attrValue = attributes.find(a => a.cType === 'elements' && a.cId === eId && a.name === attrFilter.name)?.value?.data
        if (attrFilter.value !== undefined) {
          return attrValue === attrFilter.value
        } else if (typeof attrFilter.predicate === 'function' && attrValue != null) {
          return attrFilter.predicate(attrValue)
        }
        return false
      }) ?? true
      const byComponentId = !('componentId' in query) || (query.componentId != null && this.projectData.elements[eId].components.includes(query.componentId))
      return byAttributes && byComponentId
    }) 
  }

  findComponentId(query: ComponentQuery): string|undefined {
    const attributes = Object.values(this.projectData.attributes)
    return Object.keys(this.projectData.components).find(cId => {
      const byAttributes = query.attribute?.every(attrFilter => {
        const attrValue = attributes.find(a => a.cType === 'components' && a.cId === cId && a.name === attrFilter.name)?.value?.data
        if (attrFilter.value !== undefined) {
          return attrValue === attrFilter.value
        } else if (typeof attrFilter.predicate === 'function' && attrValue != null) {
          return attrFilter.predicate(attrValue)
        }
        return false
      }) ?? true
      return byAttributes
    }) 
  }

  resetStory() {
    this.resetVariables()
    this.resetVisits()
    this.setCurrentElement(this.projectData.startingElement)
  }

  getCurrentOptions(): StoryPath[] {
   const currentElement = this.getCurrentElement()
   if (currentElement == null) {
    return []
   }
   const paths = []
   for (const output of currentElement.outputs) {
      const path = this.resolvePath(output)
      if (path != null && path.targetElementId != null) {
        paths.push(path)
      }
   }
   return paths
  }

  private resolvePath(connectionId: string): StoryPath|undefined {
    const path = new StoryPath()
    
    let next: string|undefined = connectionId
    while (next != null && path.targetElementId == null) {
      const connection = this.projectData.connections[next]
      if (connection == null) break
      next = null

      const runtimeLabel = this.getRuntimeLabel(connection)
      path.connections.push({...connection, runtimeLabel})

      if ((path.label == null || path.label == '') && runtimeLabel != '') {
        path.label = runtimeLabel
      }
      
      switch (connection.targetType) {
        case 'branches':  {
          const branch = this.projectData.branches[connection.targetid]
          next = this.evaluateBranch(branch)
          break
        }
        case 'elements': {
          path.targetElementId = connection.targetid
          break
        }
        case 'jumpers': {
          const jumper = this.projectData.jumpers[connection.targetid]
          path.targetElementId = jumper.elementId
          break
        }
          
      }
    }

    if (path.targetElementId == '') {
      path.targetElementId = undefined
    }

    if ((path.label == null || path.label == '') && path.targetElementId != null) {
      const titleOutput = this.interpreter.runScript(this.projectData.elements[path.targetElementId].title, this.varValues)
      // @ts-expect-error This is not correctly typed
      path.label = titleOutput.output
    }

    return path
  }

  private getRuntimeLabel(connection: Connection) {
    if (connection.label == null || connection.label == '') return null
    const output = this.interpreter.runScript(connection.label, this.varValues)
    // @ts-expect-error Not typed
    const label = output.output
    // TODO clean html
    return label
  }

  private evaluateBranch(branch: Branch): string|undefined {
    const conditions = [
      branch.conditions.ifCondition,
    ]
    if (branch.conditions.elseIfConditions != null) {
      conditions.push(...branch.conditions.elseIfConditions)
    }
    if (branch.conditions.elseCondition != null) {
      conditions.push(branch.conditions.elseCondition)
    }
    
    for (const conditionId of conditions) {
      const condition = this.projectData.conditions[conditionId]
      if (this.evaluateCondition(condition)) {
        return condition.output
      }
    }
  }

  private evaluateCondition(condition: Condition): boolean {
    if (condition.script == null || condition.script == '') {
      return true
    }

    const output = this.interpreter.runScript("<pre><code>"+condition.script+"</code></pre>", this.varValues);
    // @ts-expect-error This is not correctly typed
    return !!output.result.condition;
  }

  selectPath(path: StoryPath) {
    if (path.targetElementId == null) {
      return
    }
    this.setCurrentElement(path.targetElementId)
  }

  getSave(): SavedStory {
    const visits: SavedStory['visits'] = {...this.elementVisits}
    if (visits[this.currentElement] != null && visits[this.currentElement] > 0) {
      visits[this.currentElement]--
    }

    const variables: SavedStory['variables'] = {}
    for (const [vId, varObject] of Object.entries(this.varObjects)) {
      variables[varObject.name] = this.varValues[vId]
    }

    return { visits, variables, currentElement: this.currentElement }
  }

  loadSave(save: SavedStory) {
    this.resetVariables()
    this.setVariables(save.variables)

    this.resetVisits()
    Object.assign(this.elementVisits, save.visits)

    if (save.currentElement in this.projectData.elements) {
      this.setCurrentElement(save.currentElement)
    } else {
      this.currentElement = this.projectData.startingElement
    }
  }
  
}

type SavedStory = {
  currentElement: string
  variables: {[name: string]: VariableItem['value']}
  visits: {[eId: string]: number}
}