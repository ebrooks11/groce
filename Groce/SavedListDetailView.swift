import SwiftUI

struct SavedListDetailView: View {
    let listId: String

    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var showAddItem = false
    @State private var editingItem: GroceryItem?
    @State private var showRename = false
    @State private var renameName = ""
    @State private var showAddedConfirmation = false

    private var list: GroceryList? {
        store.savedLists.first { $0.id == listId }
    }

    private var sections: [(category: GroceryCategory, items: [GroceryItem])] {
        guard let list else { return [] }
        return GroceryCategory.orderedCases.compactMap { cat in
            let items = list.items.filter { $0.category == cat }
            return items.isEmpty ? nil : (cat, items)
        }
    }

    var body: some View {
        Group {
            if let list {
                ZStack(alignment: .bottomTrailing) {
                    if list.items.isEmpty {
                        emptyState
                    } else {
                        listContent
                    }

                    Button {
                        showAddItem = true
                    } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 24, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(width: 56, height: 56)
                            .background(Color.accentColor)
                            .clipShape(Circle())
                            .shadow(color: .black.opacity(0.25), radius: 4, x: 0, y: 2)
                    }
                    .padding(.trailing, 24)
                    .padding(.bottom, 32)
                }
                .navigationTitle(list.name)
                .navigationBarTitleDisplayMode(.large)
                .toolbar {
                    ToolbarItemGroup(placement: .navigationBarTrailing) {
                        Button {
                            store.addSavedListToActive(savedListId: listId)
                            showAddedConfirmation = true
                        } label: {
                            Image(systemName: "cart.badge.plus")
                        }
                        Button {
                            renameName = list.name
                            showRename = true
                        } label: {
                            Image(systemName: "pencil")
                        }
                    }
                }
            }
        }
        .onChange(of: store.savedLists.map(\.id)) { _, ids in
            if !ids.contains(listId) { dismiss() }
        }
        .sheet(isPresented: $showAddItem) {
            AddItemSheet(title: "Add Item", draft: GroceryItemDraft()) { draft in
                store.savedAddItem(listId: listId, draft: draft)
            }
        }
        .sheet(item: $editingItem) { item in
            AddItemSheet(title: "Edit Item", draft: GroceryItemDraft(from: item)) { draft in
                store.savedUpdateItem(listId: listId, item: draft.toItem(id: item.id, checked: false))
            }
        }
        .alert("Rename List", isPresented: $showRename) {
            TextField("List name", text: $renameName)
            Button("Save") {
                let name = renameName.trimmingCharacters(in: .whitespaces)
                if !name.isEmpty { store.renameSavedList(id: listId, name: name) }
            }
            Button("Cancel", role: .cancel) {}
        }
        .alert("Added!", isPresented: $showAddedConfirmation) {
            Button("OK") {}
        } message: {
            Text("\"\(list?.name ?? "")\" items have been added to your shopping list.")
        }
    }

    // MARK: - Subviews

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "list.bullet")
                .font(.system(size: 48))
                .foregroundColor(Color(.systemGray4))
            Text("No items yet")
                .font(.headline)
            Text("Tap + to add ingredients or items.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground))
    }

    private var listContent: some View {
        List {
            ForEach(sections, id: \.category) { section in
                Section {
                    ForEach(section.items) { item in
                        ItemRow(item: item, showCheckbox: false, onToggle: nil)
                            .contentShape(Rectangle())
                            .onTapGesture { editingItem = item }
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button(role: .destructive) {
                                    store.savedDeleteItem(listId: listId, itemId: item.id)
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                    }
                } header: {
                    Text(section.category.label.uppercased())
                }
            }
        }
        .listStyle(.insetGrouped)
        .safeAreaInset(edge: .bottom) {
            Color.clear.frame(height: 100)
        }
    }
}
