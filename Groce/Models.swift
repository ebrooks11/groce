import Foundation

// MARK: - Category

enum GroceryCategory: String, CaseIterable, Codable, Identifiable {
    case produce   = "Produce"
    case dairy     = "Dairy"
    case meat      = "Meat"
    case bakery    = "Bakery"
    case frozen    = "Frozen"
    case pantry    = "Pantry"
    case beverages = "Beverages"
    case other     = "Other"

    var id: String { rawValue }

    var label: String {
        self == .meat ? "Meat & Seafood" : rawValue
    }

    // Matches CATEGORY_ORDER from the RN app (same order as enum definition)
    static var orderedCases: [GroceryCategory] { allCases }
}

// MARK: - Unit

enum GroceryUnit: String, CaseIterable, Codable, Identifiable {
    case noUnit = ""
    case each   = "each"
    case lbs    = "lbs"
    case oz     = "oz"
    case kg     = "kg"
    case g      = "g"
    case pack   = "pack"
    case can    = "can"
    case box    = "box"
    case bottle = "bottle"
    case bunch  = "bunch"
    case bag    = "bag"

    var id: String { rawValue.isEmpty ? "__none" : rawValue }
    var label: String { self == .noUnit ? "None" : rawValue }
}

// MARK: - Models

struct GroceryItem: Identifiable, Codable, Equatable {
    var id: String
    var name: String
    var category: GroceryCategory
    var quantity: Double?
    var unit: GroceryUnit?
    var checked: Bool

    var qtyLabel: String? {
        let qStr = quantity.map { q -> String in
            q.truncatingRemainder(dividingBy: 1) == 0 ? String(Int(q)) : String(q)
        }
        let uStr: String? = unit.flatMap { $0 == .noUnit ? nil : $0.rawValue }
        switch (qStr, uStr) {
        case let (q?, u?): return "\(q) \(u)"
        case let (q?, nil): return q
        case let (nil, u?): return u
        default: return nil
        }
    }
}

struct GroceryList: Identifiable, Codable {
    var id: String
    var name: String
    var items: [GroceryItem]
    var createdAt: Double
}

// MARK: - Persistence

struct PersistedAppState: Codable {
    var activeList: GroceryList
    var savedLists: [GroceryList]
}

// MARK: - Draft (used by AddItemSheet)

struct GroceryItemDraft {
    var name: String = ""
    var category: GroceryCategory = .other
    var quantity: String = ""
    var unit: GroceryUnit = .noUnit

    init() {}

    init(from item: GroceryItem) {
        name = item.name
        category = item.category
        quantity = item.quantity.map { q in
            q.truncatingRemainder(dividingBy: 1) == 0 ? String(Int(q)) : String(q)
        } ?? ""
        unit = item.unit ?? .noUnit
    }

    func toItem(id: String = UUID().uuidString, checked: Bool = false) -> GroceryItem {
        GroceryItem(
            id: id,
            name: name.trimmingCharacters(in: .whitespaces),
            category: category,
            quantity: Double(quantity.trimmingCharacters(in: .whitespaces)),
            unit: unit == .noUnit ? nil : unit,
            checked: checked
        )
    }
}
