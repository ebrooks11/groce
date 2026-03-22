import Foundation
import Observation

@Observable
final class AppStore {
    var activeList: GroceryList
    var savedLists: [GroceryList]

    private let storageKey = "groce.appState"
    private var saveWorkItem: DispatchWorkItem?

    init() {
        if let data = UserDefaults.standard.data(forKey: "groce.appState"),
           let state = try? JSONDecoder().decode(PersistedAppState.self, from: data) {
            activeList = state.activeList
            savedLists = state.savedLists
        } else {
            activeList = GroceryList(
                id: "active",
                name: "My List",
                items: [],
                createdAt: Date().timeIntervalSince1970
            )
            savedLists = []
        }
    }

    // MARK: - Persistence

    private func persist() {
        saveWorkItem?.cancel()
        let workItem = DispatchWorkItem { [weak self] in
            guard let self else { return }
            let state = PersistedAppState(activeList: self.activeList, savedLists: self.savedLists)
            if let data = try? JSONEncoder().encode(state) {
                UserDefaults.standard.set(data, forKey: self.storageKey)
            }
        }
        saveWorkItem = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3, execute: workItem)
    }

    // MARK: - Active list

    func activeAddItem(_ draft: GroceryItemDraft) {
        activeList.items.append(draft.toItem())
        persist()
    }

    func activeUpdateItem(_ item: GroceryItem) {
        if let idx = activeList.items.firstIndex(where: { $0.id == item.id }) {
            activeList.items[idx] = item
            persist()
        }
    }

    func activeDeleteItem(id: String) {
        activeList.items.removeAll { $0.id == id }
        persist()
    }

    func activeToggleItem(id: String) {
        if let idx = activeList.items.firstIndex(where: { $0.id == id }) {
            activeList.items[idx].checked.toggle()
            persist()
        }
    }

    func activeClearChecked() {
        for idx in activeList.items.indices {
            activeList.items[idx].checked = false
        }
        persist()
    }

    func activeClearAll() {
        activeList.items.removeAll()
        persist()
    }

    func addSavedListToActive(savedListId: String) {
        guard let saved = savedLists.first(where: { $0.id == savedListId }) else { return }
        activeList.items = mergeItems(dest: activeList.items, src: saved.items)
        persist()
    }

    // MARK: - Saved lists

    func createSavedList(name: String) {
        let list = GroceryList(
            id: UUID().uuidString,
            name: name,
            items: [],
            createdAt: Date().timeIntervalSince1970
        )
        savedLists.append(list)
        persist()
    }

    func renameSavedList(id: String, name: String) {
        if let idx = savedLists.firstIndex(where: { $0.id == id }) {
            savedLists[idx].name = name
            persist()
        }
    }

    func deleteSavedList(id: String) {
        savedLists.removeAll { $0.id == id }
        persist()
    }

    func savedAddItem(listId: String, draft: GroceryItemDraft) {
        if let idx = savedLists.firstIndex(where: { $0.id == listId }) {
            savedLists[idx].items.append(draft.toItem())
            persist()
        }
    }

    func savedUpdateItem(listId: String, item: GroceryItem) {
        if let listIdx = savedLists.firstIndex(where: { $0.id == listId }),
           let itemIdx = savedLists[listIdx].items.firstIndex(where: { $0.id == item.id }) {
            savedLists[listIdx].items[itemIdx] = item
            persist()
        }
    }

    func savedDeleteItem(listId: String, itemId: String) {
        if let idx = savedLists.firstIndex(where: { $0.id == listId }) {
            savedLists[idx].items.removeAll { $0.id == itemId }
            persist()
        }
    }

    // MARK: - Merge logic

    private func mergeItems(dest: [GroceryItem], src: [GroceryItem]) -> [GroceryItem] {
        var result = dest
        for srcItem in src {
            if let matchIdx = result.firstIndex(where: {
                $0.name.lowercased() == srcItem.name.lowercased() && $0.category == srcItem.category
            }) {
                if let dq = result[matchIdx].quantity, let sq = srcItem.quantity {
                    result[matchIdx].quantity = dq + sq
                }
                // if quantities are missing/mixed, leave existing item unchanged
            } else {
                var copy = srcItem
                copy.id = UUID().uuidString
                copy.checked = false
                result.append(copy)
            }
        }
        return result
    }
}
