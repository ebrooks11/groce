import SwiftUI

struct ActiveListView: View {
    @Environment(AppStore.self) private var store
    @State private var showAddItem = false
    @State private var editingItem: GroceryItem?
    @State private var showAddSavedList = false
    @State private var showNoSavedLists = false
    @State private var showClearCheckedConfirm = false
    @State private var addedListName = ""
    @State private var showAddedConfirmation = false

    private var sections: [(category: GroceryCategory, items: [GroceryItem])] {
        GroceryCategory.orderedCases.compactMap { cat in
            let items = store.activeList.items.filter { $0.category == cat }
            return items.isEmpty ? nil : (cat, items)
        }
    }

    private var hasChecked: Bool {
        store.activeList.items.contains { $0.checked }
    }

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            if store.activeList.items.isEmpty {
                emptyState
            } else {
                listContent
            }

            fabRow
                .padding(.trailing, 24)
                .padding(.bottom, 32)
        }
        .navigationTitle("Shopping")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            if hasChecked {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Clear Checked") {
                        showClearCheckedConfirm = true
                    }
                    .foregroundColor(.red)
                }
            }
        }
        .sheet(isPresented: $showAddItem) {
            AddItemSheet(title: "Add Item", draft: GroceryItemDraft()) { draft in
                store.activeAddItem(draft)
            }
        }
        .sheet(item: $editingItem) { item in
            AddItemSheet(title: "Edit Item", draft: GroceryItemDraft(from: item)) { draft in
                store.activeUpdateItem(draft.toItem(id: item.id, checked: item.checked))
            }
        }
        .confirmationDialog(
            "Add a List",
            isPresented: $showAddSavedList,
            titleVisibility: .visible
        ) {
            ForEach(store.savedLists.sorted(by: { $0.name < $1.name })) { list in
                Button(list.name) {
                    store.addSavedListToActive(savedListId: list.id)
                    addedListName = list.name
                    showAddedConfirmation = true
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Choose a list to add to your shopping list")
        }
        .alert("No saved lists", isPresented: $showNoSavedLists) {
            Button("OK") {}
        } message: {
            Text("Go to the Lists tab to create a list of items you shop for regularly.")
        }
        .alert("Clear checked items?", isPresented: $showClearCheckedConfirm) {
            Button("Cancel", role: .cancel) {}
            Button("Clear") { store.activeClearChecked() }
        } message: {
            Text("Items will be unchecked, not deleted.")
        }
        .alert("Added!", isPresented: $showAddedConfirmation) {
            Button("OK") {}
        } message: {
            Text("\"\(addedListName)\" items have been added to your list.")
        }
    }

    // MARK: - Subviews

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "cart")
                .font(.system(size: 48))
                .foregroundColor(Color(.systemGray4))
            Text("Your list is empty")
                .font(.headline)
            Text("Tap + to add items, or tap the bookmark icon to add a saved list.")
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
                        ItemRow(item: item, showCheckbox: true) {
                            store.activeToggleItem(id: item.id)
                        }
                        .contentShape(Rectangle())
                        .onTapGesture { editingItem = item }
                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                            Button(role: .destructive) {
                                store.activeDeleteItem(id: item.id)
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
            Color.clear.frame(height: 110)
        }
    }

    private var fabRow: some View {
        HStack(spacing: 12) {
            Button {
                if store.savedLists.isEmpty {
                    showNoSavedLists = true
                } else {
                    showAddSavedList = true
                }
            } label: {
                Image(systemName: "bookmark")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(.accentColor)
                    .frame(width: 48, height: 48)
                    .background(Color(.systemBackground))
                    .clipShape(Circle())
                    .overlay(Circle().stroke(Color(.systemGray5), lineWidth: 1))
                    .shadow(color: .black.opacity(0.15), radius: 4, x: 0, y: 2)
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
        }
    }
}
