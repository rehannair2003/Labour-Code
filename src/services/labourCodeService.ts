import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { Banknote, BookOpen, Shield, HardHat } from 'lucide-react';

export interface Section {
  id?: string;
  title: string;
  content: string[];
}

export interface LabourCode {
  id: string;
  title: string;
  description: string;
  iconName: string;
  sections: Section[];
}

// Initial data to seed
const initialCodes: LabourCode[] = [
  {
    id: 'wages',
    title: "Code on Wages, 2019",
    iconName: 'Banknote',
    description: "Consolidates laws relating to wages and bonus and matters connected therewith or incidental thereto.",
    sections: [
      {
        title: "Key Highlights",
        content: [
          "Universalizes the provisions of minimum wages and timely payment of wages to all employees irrespective of the sector and wage ceiling.",
          "Introduces the concept of 'Floor Wage', which is to be determined by the Central Government.",
          "Amalgamates 4 existing laws: The Payment of Wages Act, 1936; The Minimum Wages Act, 1948; The Payment of Bonus Act, 1965; and The Equal Remuneration Act, 1976."
        ]
      },
      {
        title: "Impact",
        content: [
          "Ensures timely payment of wages for all workers.",
          "Simplifies compliance for employers by reducing the number of registers and returns.",
          "Promotes gender equality by prohibiting discrimination in wages and recruitment."
        ]
      }
    ]
  },
  {
    id: 'ir',
    title: "Industrial Relations Code, 2020",
    iconName: 'BookOpen',
    description: "Consolidates and amends the laws relating to Trade Unions, conditions of employment in industrial establishment or undertaking, investigation and settlement of industrial disputes.",
    sections: [
      {
        title: "Key Highlights",
        content: [
          "Introduces a new provision for 'Fixed Term Employment'.",
          "Increases the threshold for standing orders from 100 to 300 workers.",
          "Amalgamates 3 existing laws: The Trade Unions Act, 1926; The Industrial Employment (Standing Orders) Act, 1946; and The Industrial Disputes Act, 1947."
        ]
      },
      {
        title: "Impact",
        content: [
          "Provides flexibility to employers in hiring and firing.",
          "Encourages ease of doing business while protecting workers' rights.",
          "Streamlines the process of dispute resolution."
        ]
      }
    ]
  },
  {
    id: 'social-security',
    title: "Code on Social Security, 2020",
    iconName: 'Shield',
    description: "Amends and consolidates the laws relating to social security with the goal to extend social security to all employees and workers either in the organized or unorganized or any other sectors.",
    sections: [
      {
        title: "Key Highlights",
        content: [
          "Extends social security to gig workers and platform workers.",
          "Proposes a National Social Security Board for unorganized workers.",
          "Amalgamates 9 existing laws including The Employees' Provident Funds Act, 1952 and The Maternity Benefit Act, 1961."
        ]
      },
      {
        title: "Impact",
        content: [
          "Expands the safety net to a larger workforce.",
          "Digitizes the registration and compliance process.",
          "Ensures portability of social security benefits."
        ]
      }
    ]
  },
  {
    id: 'osh',
    title: "OSH Code, 2020",
    iconName: 'HardHat',
    description: "Consolidates and amends the laws regulating the occupational safety, health and working conditions of the persons employed in an establishment.",
    sections: [
      {
        title: "Key Highlights",
        content: [
          "Empowers the Central Government to declare standards on occupational safety and health.",
          "Introduces a single license for staffing firms and allows them to operate across India.",
          "Amalgamates 13 existing laws including The Factories Act, 1948 and The Contract Labour (Regulation and Abolition) Act, 1970."
        ]
      },
      {
        title: "Impact",
        content: [
          "Improves working conditions and safety standards.",
          "Reduces the compliance burden on employers.",
          "Promotes the welfare of inter-state migrant workers."
        ]
      }
    ]
  }
];

export interface CaseLaw {
  id: string;
  title: string;
  court: string;
  year: number;
  citation: string;
  summary: string;
  relatedSectionIds: string[];
}

export const getCaseLaws = async (): Promise<CaseLaw[]> => {
  const path = 'caseLaws';
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CaseLaw));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getLabourCode = async (codeId: string): Promise<LabourCode | null> => {
  try {
    const codesPath = 'codes';
    let codeDoc;
    try {
      codeDoc = await getDocs(collection(db, codesPath));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, codesPath);
      return null; // Should not reach here as handleFirestoreError throws
    }
    
    const codeData = codeDoc.docs.find(d => d.id === codeId);
    
    if (codeData) {
      const data = codeData.data();
      // Fetch sections subcollection
      const sectionsPath = `codes/${codeId}/sections`;
      let sectionsSnapshot;
      try {
        sectionsSnapshot = await getDocs(collection(db, sectionsPath));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, sectionsPath);
        return null; // Should not reach here
      }
      
      const sections = sectionsSnapshot.docs.map(doc => doc.data() as Section);
      
      return {
        id: codeData.id,
        title: data.title,
        description: data.description,
        iconName: data.iconName,
        sections: sections
      };
    }
    
    // Fallback to initial data if not found in DB (or seed it)
    const initialCode = initialCodes.find(c => c.id === codeId);
    if (initialCode) {
      // Optional: Seed the DB here if you want auto-seeding
      // await seedDatabase(); 
      return initialCode;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching code:", error);
    // Fallback to local data on error
    return initialCodes.find(c => c.id === codeId) || null;
  }
};

const initialCaseLaws: Partial<CaseLaw>[] = [
  {
    title: "Bangalore Water Supply vs A. Rajappa",
    court: "Supreme Court of India",
    year: 1978,
    citation: "1978 AIR 548",
    summary: "Defined the scope of 'Industry' under the Industrial Disputes Act, establishing the triple test: systematic activity, cooperation between employer and employee, and production of goods/services.",
    relatedSectionIds: ["ir-code", "definitions"]
  },
  {
    title: "Excel Wear vs Union of India",
    court: "Supreme Court of India",
    year: 1978,
    citation: "1979 AIR 25",
    summary: "Struck down Section 25-O of the Industrial Disputes Act as unconstitutional, affirming the right of an employer to close down a business, subject to reasonable restrictions.",
    relatedSectionIds: ["ir-code", "closure"]
  },
  {
    title: "Vishaka vs State of Rajasthan",
    court: "Supreme Court of India",
    year: 1997,
    citation: "AIR 1997 SC 3011",
    summary: "Laid down guidelines for prevention of sexual harassment at workplace, which are now integrated into the OSH Code and other social security measures.",
    relatedSectionIds: ["osh-code", "women-safety"]
  }
];

export const seedDatabase = async () => {
  const batch = writeBatch(db);
  const codesPath = 'codes';
  const caseLawsPath = 'caseLaws';
  
  try {
    // Seed Codes
    for (const code of initialCodes) {
      const codeRef = doc(db, codesPath, code.id);
      batch.set(codeRef, {
        title: code.title,
        description: code.description,
        iconName: code.iconName
      });
      
      for (const section of code.sections) {
        const sectionId = section.title.toLowerCase().replace(/\s+/g, '-');
        const sectionRef = doc(db, `codes/${code.id}/sections`, sectionId);
        batch.set(sectionRef, section);
      }
    }

    // Seed Case Laws
    for (const caseLaw of initialCaseLaws) {
      const caseId = caseLaw.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (caseId) {
        const caseRef = doc(db, caseLawsPath, caseId);
        batch.set(caseRef, caseLaw);
      }
    }
    
    await batch.commit();
    console.log("Database seeded successfully");
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, codesPath);
  }
};
